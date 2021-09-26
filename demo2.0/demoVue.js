var app = new Vue({
  el: "#viewArea",
  data: {
    itemNum: 1,
    textList: [],
    lineList: [],
    mouseLeft: 0,
    mouseTop: 0,
    pointPosition: {},
    selectItem: {
      top: 0,
      left: 0,
      zIndex: 1,
      guid: 0,
      name: "",
      defaultVaue: "",
      width: "",
      height: "",
      fontSize: "",
      fontWeight: "",
      fontFamily: "",
    },
  },
  watch: {},

  methods: {
    addNew(item) {
      if (item === "text") {
        this.textList.push({
          top: 0,
          left: 0,
          zIndex: 1,
          active: false,
          guid: this.itemNum,
          name: "text" + this.itemNum,
          defaultVaue: "",
          width: "",
          height: "",
          fontSize: "16",
          fontWeight: "normal",
          fontFamily: "黑体",
        });
      } else {
        this.lineList.push({
          startX: 50,
          startY: 50,
          endX: 150,
          endY: 50,
        });
        this.pointPosition = {
          show: true,
          startActive: false,
          endActive: false,
          startX: 46,
          startY: 46,
          endX: 146,
          endY: 46,
        };
        this.drawLine(50, 50, 150, 50);
      }
      this.itemNum++;
    },
    dragEvent(event, item) {
      var itemObj = event.target;
      this.mouseLeft = event.clientX - itemObj.offsetLeft;
      this.mouseTop = event.clientY - itemObj.offsetTop;
      this.selectItem = item;
      item.active = true;
      item.zIndex = 99;
    },
    pointDragEvent(event, item, num) {
      console.log("drag");
      var itemObj = event.target;
      this.mouseLeft = event.clientX - itemObj.offsetLeft;
      console.log(event);
      console.log(event.clientX);
      console.log(itemObj.offsetLeft);
      this.mouseTop = event.clientY - itemObj.offsetTop;
      if (num === 1) {
        item.startActive = true;
      } else {
        item.endActive = true;
      }
    },
    pullEvent(event, item) {
      var left = event.clientX - this.mouseLeft;
      var top = event.clientY - this.mouseTop;
      item.left = left;
      item.top = top;
    },
    pointPullEvent(event, item, num) {
      console.log("move");
      var left = event.clientX - this.mouseLeft;
      var top = event.clientY - this.mouseTop;
      if (num === 1) {
        item.startX = left;
        item.startY = top;
      } else {
        item.endX = left;
        item.endY = top;
      }
    },
    pointDropEvent(item, num) {
      console.log("drop");
      if (num === 1) {
        item.startActive = false;
      } else {
        item.endActive = false;
      }
      this.drawLine(
        this.pointPosition.startX + 4,
        this.pointPosition.startY + 4,
        this.pointPosition.endX + 4,
        this.pointPosition.endY + 4
      );
    },
    dropEvent(item) {
      item.active = false;
      item.zIndex = 1;
    },
    drawLine(startX, startY, endX, endY) {
      var c = document.getElementById("drawCanvas");
      console.log(c);
      c.height = c.height;
      var ctx = c.getContext("2d");
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    },
  },
});
