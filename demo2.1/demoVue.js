var app = new Vue({
  el: "#viewArea",
  data: {
    elementContent: [],
    selectElementIndex: null,
    elementIndex: 1,
    mouseLeft: 0,
    mouseTop: 0,
    dragDropActive: false,
    canvasSquare: {
      visible: false,
      edit: false,
      width: 500,
      height: 500,
    },
  },
  computed: {
    getElementAttribute() {
      return function (val) {
        var computedLeft = val.left + "px";
        var computedTop = val.top + "px";
        if (val.type === "line") {
          computedLeft = val.left - 4 + "px";
          computedTop = val.top - 4 + "px";
        } else if (val.type === "point") {
          var startX = 0;
          var startY = 0;
          var endX = 0;
          var endY = 0;
          this.elementContent.forEach(function (item) {
            if (item.type === "line") {
              if (item.id === val.startPoint) {
                startX = item.left;
                startY = item.top;
              } else if (item.id === val.endPoint) {
                endX = item.left;
                endY = item.top;
              }
            }
          });
          computedLeft = (startX + endX) / 2 - 4 + "px";
          computedTop = (startY + endY) / 2 - 4 + "px";
        }
        return {
          left: computedLeft,
          top: computedTop,
          //   left:
          //     val.type === "line" || val.type === "point"
          //       ? val.left - 4 + "px"
          //       : val.left + "px",
          //   top:
          //     val.type === "line" || val.type === "point"
          //       ? val.top - 4 + "px"
          //       : val.top + "px",
          width: val.width ? val.width + "px" : "",
          height: val.height ? val.height + "px" : "",
          "background-color": val.edit ? "#40a2de" : "white",
          border:
            val.type === "line" || val.type === "point" ? "1px solid gray" : "",
          "border-radius": val.type === "point" ? "50%" : "",
          "font-size": val.fontSize + "px",
          "font-weight": val.fontWeight,
          "font-family": val.fontFamily,
          cursor:
            val.type === "point"
              ? "pointer"
              : val.type === "line"
              ? "crosshair"
              : "move",
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
    editCanvasSquare() {
      this.elementContent.forEach(function (item) {
        if (item.type === "line") {
          item.visible = false;
        }
        item.edit = false;
      });
      this.selectElementIndex = null;
      this.canvasSquare.edit = true;
    },
    // changeValue(key, val) {
    //   this.canvasSquare[key] = val;
    // },
    dragEvent(event, val) {
      val.edit = true;
      this.elementContent.forEach(function (item) {
        item.edit = false;
      });
      this.selectElementIndex = this.elementContent.findIndex(function (item) {
        return item.edit;
      });
      this.canvasSquare.edit = false;
      if (val.type === "line" && !val.visible) {
        return false;
      }
      if (val.type === "point") {
        this.elementContent.forEach(function (item) {
          if (item.type === "line") {
            if (item.id === val.startPoint || item.id === val.endPoint) {
              item.visible = true;
            } else {
              item.visible = false;
            }
          }
        });
        return false;
      }

      console.log("mousedown");
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
        console.log("move");
        if (_this.dragDropActive) {
          var left = event.clientX - _this.mouseLeft;
          var top = event.clientY - _this.mouseTop;
          if (left >= 0 && top >= 0) {
            val.left = left;
            val.top = top;
            this.drawCanvas();
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
        console.log("mouseup");
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
            top: 50,
            left: 150,
            width: 8,
            height: 8,
            linkPoint: this.elementIndex - 1,
          })
        );
        this.elementContent.push(
          this.itemInstance("point", this.elementIndex, true, {
            top: (50 + 50) / 2,
            left: (150 + 50) / 2,
            width: 8,
            height: 8,
            startPoint: this.elementIndex - 2,
            endPoint: this.elementIndex - 1,
          })
        );
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
      o.startPoint = argumentObj.startPoint || "";
      o.endPoint = argumentObj.endPoint || "";
      o.edit = false;
      this.elementIndex++;
      return o;
    },
    drawCanvas() {
      // 获取所有画线
      var o = new Object();
      this.elementContent.forEach(function (item, index, arr) {
        if (item.type === "line") {
          if (item.id === item.linkPoint) {
            o[item.id] = {
              startX: item.left,
              startY: item.top,
            };
          } else {
            o[item.linkPoint].endX = item.left;
            o[item.linkPoint].endY = item.top;
          }
        }
      });
      var c = document.getElementById("drawCanvas");
      c.height = c.height;
      var ctx = c.getContext("2d");
      for (var lineIndex in o) {
        ctx.moveTo(o[lineIndex].startX, o[lineIndex].startY);
        ctx.lineTo(o[lineIndex].endX, o[lineIndex].endY);
      }
      ctx.stroke();
    },
  },
});
