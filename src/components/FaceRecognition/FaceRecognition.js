import React from "react";
import "./FaceRecognition.css";

const FaceRecognition = ({ imageUrl, coordinates }) => {
  return (
    <div className="center ma">
      <div className="absolute mt2">
        <img
          id="inputImage"
          alt=""
          src={imageUrl}
          width="500px"
          height="auto"
        />
        <div
          className="bounding-box"
          style={{
            top: coordinates.topRow,
            right: coordinates.rightCol,
            bottom: coordinates.bottomRow,
            left: coordinates.leftCol
          }}
        ></div>
      </div>
    </div>
  );
};

export default FaceRecognition;
