var app = new Vue({
  el: "#viewArea",
  data: {
    elementContent: [], // 画布上绘制的所有文本、点
    selectElementIndex: null, // 选中文本元素的id
    selectStratPointIndex: null, // 选中线的起始点id
    selectEndPointIndex: null, // 选中线的结束点id
    elementIndex: 1, // 画布上元素id，自增
    mouseLeft: 0, // 鼠标点击x坐标
    mouseTop: 0, // 鼠标点击y坐标
    dragDropActive: false, // 拖拽激活状态
    canvasSquare: {
      visible: false, // 画布是否显示
      edit: false, // 画布是否处于编辑状态
      width: 500, // 画布宽度
      height: 500, // 画布高度
    },
    lineInstance: {},
  },
  computed: {
    getElementAttribute() {
      return function (val) {
        var computedLeft = val.left + "px";
        var computedTop = val.top + "px";
        if (val.type === "line") {
          computedLeft = val.left - 4 + "px";
          computedTop = val.top - 4 + "px";
        }
        return {
          left: computedLeft,
          top: computedTop,
          width: val.width ? val.width + "px" : "",
          height: val.height ? val.height + "px" : "",
          "background-color":
            val.edit && val.type !== "line" ? "#40a2de" : "white",
          border: val.type === "line" ? "1px solid gray" : "",
          "font-size": val.fontSize + "px",
          "font-weight": val.fontWeight,
          "font-family": val.fontFamily,
          cursor: val.type === "line" ? "crosshair" : "move",
        };
      };
    },
    getCanvasWidth() {
      return this.canvasSquare.width;
    },
    getCanvasHeight() {
      return this.canvasSquare.height;
    },
  },
  methods: {
    create() {
      if (!this.canvasSquare.visible) {
        this.canvasSquare.visible = true;
      }
    },
    editCanvasSquare(event) {
      this.selectStratPointIndex = null;
      this.selectEndPointIndex = null;
      var x_down = event.clientX; //鼠标按下X的坐标
      var y_down = event.clientY; //鼠标按下Y的坐标
      var leftDown = this.$refs.canvasArea.offsetLeft; //获取盒子的初始left值
      var topDown = this.$refs.canvasArea.offsetTop; //获取盒子的初始top值
      var mouseLeft = x_down - leftDown;
      var mouseTop = y_down - topDown;
      this.elementContent.forEach(function (item) {
        item.edit = false;
      });
      var selectLine = false;
      for (var lineIndex in this.lineInstance) {
        if (selectLine) {
          break;
        }
        var startX = this.lineInstance[lineIndex].startX;
        var startY = this.lineInstance[lineIndex].startY;
        var endX = this.lineInstance[lineIndex].endX;
        var endY = this.lineInstance[lineIndex].endY;
        var startId = this.lineInstance[lineIndex].startId;
        var endId = this.lineInstance[lineIndex].endId;

        var isPointOnSegmen = this.isPointOnSegmen(
          { x: startX, y: startY },
          { x: endX, y: endY },
          { x: mouseLeft, y: mouseTop }
        );
        var _this = this;
        if (isPointOnSegmen) {
          this.elementContent.forEach(function (item, index) {
            if (item.id === startId) {
              item.edit = true;
              _this.selectStratPointIndex = index;
            }
            if (item.id === endId) {
              item.edit = true;
              _this.selectEndPointIndex = index;
            }
          });
          selectLine = true;
        }
      }
      if (selectLine) {
        this.canvasSquare.edit = false;
      } else {
        this.canvasSquare.edit = true;
      }
      this.selectElementIndex = null;
    },
    // 判断鼠标点击的位置是否在线上，error为误差
    isPointOnSegmen(p1, p2, q) {
      var p1x = p1.x;
      var p1y = p1.y;
      var p2x = p2.x;
      var p2y = p2.y;
      var qx = q.x;
      var qy = q.y;
      var error = 4;
      if (
        qx + error < (p1x > p2x ? p2x : p1x) ||
        qx - error > (p1x > p2x ? p1x : p2x)
      ) {
        return false;
      }
      if (
        qy + error < (p1y > p2y ? p2y : p1y) ||
        qy - error > (p1y > p2y ? p1y : p2y)
      ) {
        return false;
      }
      if (p1x === p2x) {
        // 没有斜率
        return true;
      } else if (p1y === p2y) {
        // 斜率为0
        return true;
      } else {
        var A = Number(((p2y - p1y) / (p2x - p1x)).toFixed(3));
        var B = -1;
        var C = Number((p1y - p1x * A).toFixed(3));
        var length =
          Math.abs(A * qx + B * qy + C) /
          Math.sqrt(Math.pow(A, 2) + Math.pow(B, 2));
        if (length <= error) {
          return true;
        }
      }
      return false;
    },
    inputChange() {
      this.getAllLine();
      this.drawCanvas();
    },
    dragEvent(event, val) {
      this.elementContent.forEach(function (item, index) {
        if (val.type === "line") {
          if (
            index === this.selectStratPointIndex ||
            index === this.selectEndPointIndex
          ) {
            item.edit = true;
          }
        } else {
          item.edit = false;
        }
      });
      this.canvasSquare.edit = false;
      if (val.type === "line") {
        if (!val.edit) {
          return false;
        }
      } else {
        val.edit = true;
        this.selectElementIndex = this.elementContent.findIndex(function (
          item
        ) {
          return item.edit;
        });
        this.selectStratPointIndex = null;
        this.selectEndPointIndex = null;
      }
      var elementObj = event.target;
      var x_down = event.clientX; //鼠标按下X的坐标
      var y_down = event.clientY; //鼠标按下Y的坐标
      var leftDown = elementObj.offsetLeft; //获取盒子的初始left值
      var topDown = elementObj.offsetTop; //获取盒子的初始top值
      this.mouseLeft = x_down - leftDown;
      this.mouseTop = y_down - topDown;
      this.dragDropActive = true;
      var _this = this;
      this.pullEvent = function (event) {
        if (_this.dragDropActive) {
          var left = event.clientX - _this.mouseLeft;
          var top = event.clientY - _this.mouseTop;
          if (left >= 0 && top >= 0) {
            val.left = left;
            val.top = top;
            _this.getAllLine();
            _this.drawCanvas();
          } else {
            _this.dragDropActive = false;
            _this.pullEvent = function () {};
            _this.dropEvent = function () {};
          }
        }
      };
      this.dropEvent = function () {
        this.dragDropActive = false;
        this.dropEvent = function () {};
        this.pullEvent = function () {};
      };
    },
    pullEvent() {},
    dropEvent() {},
    addNew(val) {
      if (!this.canvasSquare.visible) {
        alert("请先点击新建创建画布！");
        return;
      }
      if (val === "text") {
        this.elementContent.push(
          this.itemInstance(val, this.elementIndex, true, {
            top: 0,
            left: 0,
            name: "text" + this.elementIndex,
            fontSize: "16",
            fontWeight: "normal",
            fontFamily: "黑体",
          })
        );
      } else if (val === "line") {
        this.elementContent.push(
          this.itemInstance(val, this.elementIndex, false, {
            top: 50,
            left: 50,
            width: 8,
            height: 8,
            linkPoint: this.elementIndex,
          })
        );
        this.elementContent.push(
          this.itemInstance(val, this.elementIndex, false, {
            top: 150,
            left: 150,
            width: 8,
            height: 8,
            linkPoint: this.elementIndex - 1,
          })
        );
        this.getAllLine();
        this.drawCanvas();
      }
    },
    itemInstance(type, num, visible, argumentObj) {
      var o = new Object();
      o.type = type;
      o.id = num;
      o.visible = visible;
      o.top = argumentObj.top || 0;
      o.left = argumentObj.left || 0;
      o.name = argumentObj.name || "";
      o.defaultValue = argumentObj.defaultValue || "";
      o.width = argumentObj.width || "";
      o.height = argumentObj.height || "";
      o.fontSize = argumentObj.fontSize || "";
      o.fontWeight = argumentObj.fontWeight || "";
      o.fontFamily = argumentObj.fontFamily || "";
      o.linkPoint = argumentObj.linkPoint || "";
      o.edit = false;
      this.elementIndex++;
      return o;
    },
    getAllLine() {
      // 获取所有画线
      var o = new Object();
      this.elementContent.forEach(function (item, index, arr) {
        if (item.type === "line") {
          if (item.id === item.linkPoint) {
            o[item.id] = {
              startX: item.left,
              startY: item.top,
              startId: item.id,
            };
          } else {
            o[item.linkPoint].endX = item.left;
            o[item.linkPoint].endY = item.top;
            o[item.linkPoint].endId = item.id;
          }
        }
      });
      this.lineInstance = o;
    },
    drawCanvas() {
      var c = document.getElementById("drawCanvas");
      c.height = c.height;
      var ctx = c.getContext("2d");
      for (var lineIndex in this.lineInstance) {
        ctx.moveTo(
          this.lineInstance[lineIndex].startX,
          this.lineInstance[lineIndex].startY
        );
        ctx.lineTo(
          this.lineInstance[lineIndex].endX,
          this.lineInstance[lineIndex].endY
        );
      }
      ctx.stroke();
    },
  },
});
