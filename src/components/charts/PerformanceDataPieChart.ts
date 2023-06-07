import { type ReactEChartsProps } from "./React-Echarts";

const legend = {
  bottom: "0%",
  left: "center",
  textStyle: {
    color: "#fff"
  }
};

const itemStyle = {
  borderRadius: 4,
  borderColor: "#fff",
  borderWidth: 1,
  
};

export const ProjectPerformanceRatingSafety: ReactEChartsProps["option"] = {
  //   title: {
  //     text: "Project Performance Rating - Safety",
  //   },

  tooltip: {
    trigger: "item",
  },
  toolbox: {
    // y: 'bottom',
    feature: {
      magicType: {
        type: ["stack"],
      },
      dataView: {},
      saveAsImage: {
        pixelRatio: 2,
      },
    },
  },
  legend,
  series: [
    {
      name: "Access From",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: "normal",
        },
      },
      labelLine: {
        show: true,
      },
      data: [
        { value: 173, name: "Good" },
        { value: 12, name: "Ok" },
        { value: 1, name: "Poor" },
        { value: 0, name: "Bad" },
      ],
    },
  ],
};

export const ProjectPerformanceRatingQuality: ReactEChartsProps["option"] = {
  //   title: {
  //     text: "Project Performance Rating - Quality",
  //   },

  tooltip: {
    trigger: "item",
  },
  toolbox: {
    // y: 'bottom',
    feature: {
      magicType: {
        type: ["stack"],
      },
      dataView: {},
      saveAsImage: {
        pixelRatio: 2,
      },
    },
  },
  legend,
  series: [
    {
      name: "Access From",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: "normal",
        },
      },
      labelLine: {
        show: true,
      },
      data: [
        { value: 161, name: "Good" },
        { value: 17, name: "Ok" },
        { value: 1, name: "Poor" },
        { value: 0, name: "Bad" },
      ],
    },
  ],
};

export const ProjectPerformanceRatingStaffing: ReactEChartsProps["option"] = {
  //   title: {
  //     text: "Project Performance Rating - Staffing",
  //   },

  tooltip: {
    trigger: "item",
  },
  toolbox: {
    // y: 'bottom',
    feature: {
      magicType: {
        type: ["stack"],
      },
      dataView: {},
      saveAsImage: {
        pixelRatio: 2,
      },
    },
  },
  legend,
  series: [
    {
      name: "Access From",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: "normal",
        },
      },
      labelLine: {
        show: true,
      },
      data: [
        { value: 169, name: "Good" },
        { value: 9, name: "Ok" },
        { value: 2, name: "Poor" },
        { value: 0, name: "Bad" },
      ],
    },
  ],
};

export const ProjectPerformanceRatingCustomer: ReactEChartsProps["option"] = {
  //   title: {
  //     text: "Project Performance Rating - Customer",
  //   },

  tooltip: {
    trigger: "item",
  },
  toolbox: {
    // y: 'bottom',
    feature: {
      magicType: {
        type: ["stack"],
      },
      dataView: {},
      saveAsImage: {
        pixelRatio: 2,
      },
    },
  },
  legend,
  series: [
    {
      name: "Access From",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: "normal",
        },
      },
      labelLine: {
        show: true,
      },
      data: [
        { value: 163, name: "Good" },
        { value: 15, name: "Ok" },
        { value: 2, name: "Poor" },
        { value: 1, name: "Bad" },
      ],
    },
  ],
};
