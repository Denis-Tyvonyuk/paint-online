import React from "react";
import "./styles/app.scss";
import Toolbar from "./components/Toolbar";
import SettingBar from "./components/SettingBar";
import Canvas from "./components/Canvas";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  try {
    return (
      <BrowserRouter>
        <Routes>
          <Route
            path="/:id"
            element={
              <>
                <Toolbar />
                <SettingBar />
                <Canvas />
              </>
            }
          />
          <Route
            path="/"
            element={
              <>
                <Toolbar />
                <SettingBar />
                <Canvas />
                <Navigate to={`/f${(+new Date()).toString(16)}`} replace />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    );
  } catch (e) {
    console.log(e);
  }
}

export default App;
