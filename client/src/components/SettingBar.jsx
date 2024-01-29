import React from "react";
import "../styles/toolbar.scss";
import toolState from "../store/toolState";

const SettingBar = () => {
  return (
    <div className="setting-bar">
      <label htmlFor="line-width"> width line </label>
      <input
        onChange={(e) => toolState.setLineWidth(e.target.value)}
        id="line-width"
        style={{ margin: "0 10px" }}
        type="number"
        min={1}
        max={50}
        defaultValue={1}
      />
      <label htmlFor="stroke-color">stroke color</label>
      <input
        id="stroke-color"
        type="color"
        onChange={(e) => toolState.setStrokeColor(e.target.value)}
      />
    </div>
  );
};

export default SettingBar;
