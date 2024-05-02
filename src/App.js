// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";

import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
// 2. TODO - Import drawing utility here
import { drawRect } from "./utilities";
import logo from "./assets/ChefMate.png"
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useNavigate } from "react-router-dom";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [item,setItem]= useState();
  const [ingredients,setIngredients]= useState([]);

  const navigate = useNavigate();

  const gotToNewPage=()=>{
    navigate("/step-1",{state:ingredients});
  }


  // Main function
  const runCoco = async () => {
    // 3. TODO - Load network 
    const net = await cocossd.load();
    
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

    
      const obj = await net.detect(video);
      obj.forEach(element => {
        const item = element.class;
        if(item !== 'person'){
          setItem(item);
        } 
      });
      

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");

 
      drawRect(obj,ctx); 
    }
  };
  const setItems = ()=>{
    console.log(item);

    if(!ingredients.includes(item) && item !==undefined ){

      setIngredients([...ingredients,item]);
    }
  }

  useEffect(()=>{runCoco()},[]);



  



  return (
    <div className="App">
      <div className="Logo">
        <img src={logo} alt="Logo" style={{width:'10%'}} />
      </div>
      <div style={{height:500,width:300,position:'absolute',right:10,border:'2px solid #B34D2D',display:'flex',flexDirection:'column'}}>
        <div style={{color:'#B34D2D',fontSize:'20px'}}>Ingredients</div>
        {ingredients.map((ingredient)=>
          <div style={{color:'#B34D2D',marginTop:'30px'}} >{ingredient}</div>
        )}
         {ingredients.length !== 0 &&  
                    <Button type="primary" 
                    style={{background:'#B34D2D',position:'absolute',bottom:0,width:'80%',margin:30}}
                    onClick={()=>gotToNewPage()}>Enter Amounts</Button>       
         }
      </div>

      <div style={{color:'#B34D2D',fontSize:'20px',margin:20,fontWeight:500}}>
        Point the ingredients you have to the camera,<br/> when the ingredient is detected press Add button.<br/> 
        Press Enter Amounts to start the Procedure.        
      </div>
      <div className="Canvas">
        <Webcam
          ref={webcamRef}
          muted={true} 
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />      
      </div>
      <div style={{margin:'20px'}}>
      <Button 
        icon={<PlusOutlined />} 
        style={{color:'#426B1F',borderColor:'#426B1F',marginRight:'20px',width:'150px'}} 
        onClick={setItems}
        >Add
      </Button>
      </div>
   
      
    </div>
  );
}

export default App;
