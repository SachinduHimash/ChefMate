// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";

import * as cocossd from "@tensorflow-models/coco-ssd";
import * as handpose from "@tensorflow-models/handpose";

import Webcam from "react-webcam";
import "./App.css";

import * as fp from "fingerpose";
import * as fpg from "fingerpose-gestures";

import { drawRect,drawHand } from "./utilities";
import logo from "./assets/ChefMate.png"
import { Button } from 'antd';
import { AudioOutlined,AudioMutedOutlined } from '@ant-design/icons';

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [item,setItem]= useState();
  const [draft,setDraft]=useState();
  const [ingredients,setIngredients]=useState([]);
  const {transcript,listening,resetTranscript} = useSpeechRecognition();
  const [gesture,setGesture]=useState();

  const Instructions=[
    {step:1,text:'Point the ingredients you have to the camera.'},
    {step:2,text:'When the ingredient is detected say the amount to add it to the draft .'},
    {step:3,text:'Show 👌 to add into ingredients'}
  ]

  // Main function
  const runCoco = async () => {
    const net = await cocossd.load();
    console.log("Coco model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
     detect2(net);
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
          if(item && item !== 'person'){
            setItem(item);   
            SpeechRecognition.startListening()
          } 
        });
  
        // Draw mesh
        const ctx = canvasRef.current.getContext("2d"); 
        drawRect(obj,ctx); 
      
      
      
    }
  };

  const detect2 = async (net) => {
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

      // Make Detections
      const hand = await net.estimateHands(video);
      // console.log(hand);


      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fpg.Gestures.okGesture,
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          console.log(gesture.gestures);

          if(gesture.gestures[0].score>7.5){
            setGesture(true);
          }

          // const confidence = gesture.gestures.map(
          //   (prediction) => prediction.confidence
          // );
          // const maxConfidence = confidence.indexOf(
          //   Math.max.apply(null, confidence)
          // );
          // // console.log(gesture.gestures[maxConfidence].name);
          // if(gesture.gestures[maxConfidence].confidence>8.5){

          //    setGesture(gesture.gestures[maxConfidence].name);
          //    console.log("yes")
          // }
          // else{
          //   setGesture()
          // }
          
          
        }
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  


  useEffect(()=>{runCoco()},[]);
  useEffect(()=>{runHandpose()},[]);

  useEffect(()=>{ if(transcript ){setDraft(item+" "+transcript)};setGesture(false);setItem()},[transcript])
  useEffect(()=>
  {console.log(gesture)
    if(gesture === true && draft){
    setIngredients([...ingredients,draft]);
    console.log(draft,ingredients);
    setDraft();
    setGesture(false)}},[gesture]);




  return (
    <div className="App">
      <div className="Logo">
        <img src={logo} alt="Logo" style={{width:'10%'}} />
      </div>
      <div style={{position:'absolute',right:10}}>
        <div style={{height:100,width:300,border:'2px solid #B34D2D',display:'flex',flexDirection:'column',padding:10}}>
        <div style={{color:'#B34D2D',fontSize:'20px',marginTop:10}}>Draft</div>    
        <div style={{color:'#B34D2D',marginTop:'20px',textAlign:'start'}} >{draft}</div>
        </div>
        <div style={{height:380,width:300,border:'2px solid #B34D2D',display:'flex',flexDirection:'column',padding:10,marginTop:20}}>
        <div style={{color:'#B34D2D',fontSize:'20px',marginTop:10}}>Ingredients</div>
        {ingredients.map((ingredient)=>
          <div key={ingredient} 
               style={{color:'#B34D2D',marginTop:'20px',textAlign:'start'}} >
                {ingredient}
          </div>
        )}
      </div>
      </div>
      <div style={{height:500,width:300,position:'absolute',left:10,border:'2px solid #B34D2D',display:'flex',flexDirection:'column',padding:10}}>
        <div style={{color:'#B34D2D',fontSize:'20px',marginTop:10}}>Instructions</div>
        {Instructions.map((instruction)=>
          <div key={instruction.step} 
               style={{color:'#B34D2D',marginTop:'20px',textAlign:'start'}} >
                {instruction.step} . {instruction.text}
          </div>
        )}
      </div>
      
      <div style={{height:50}}>
      {listening ? 
      <Button type="primary" icon={<AudioOutlined />} style={{width:200,background:'#426B1F',margin:10}}>Microphone Status: On</Button>
      : 
      <Button type="primary" icon={<AudioMutedOutlined />} style={{width:200,background:'#B34D2D',margin:10}}>Microphone Status: Off</Button>}
        <Button 
            style={{color:'#426B1F',borderColor:'#426B1F',width:'200px'}} 
          >{item} {item? "Detected":""}
        </Button>
        
      
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
    </div>
  );
}

export default App;
