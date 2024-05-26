// Import dependencies
import React, { useRef, useState, useEffect, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";

import * as cocossd from "@tensorflow-models/coco-ssd";
import * as handpose from "@tensorflow-models/handpose";

import Webcam from "react-webcam";
import "./App.css";

import * as fp from "fingerpose";
import * as fpg from "fingerpose-gestures";

import { drawRect,drawHand } from "./utilities";
import logo from "./assets/ChefMate.png"
import { Button,Card,Popconfirm } from 'antd';
import { AudioOutlined,AudioMutedOutlined,PlusOutlined,BulbOutlined } from '@ant-design/icons';

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import axios from 'axios';


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [item,setItem]= useState();
  const [draft,setDraft]=useState();
  const [ingredients,setIngredients]=useState([]);
  const [rawingredients,setRawIngredients]=useState([]);
  const [recipes,setReceipes]=useState([]);
  const {transcript,listening,resetTranscript} = useSpeechRecognition();
  const [okgesture,setOkGesture]=useState();
  const [removegesture,setRemoveGesture]=useState();
  const [latestItem,setLatestItem]=useState("");
  const { Meta } = Card;


  const Instructions=[
    {step:1,text:'Point the ingredients you have to the camera.'},
    {step:2,text:'When the ingredient is detected say the amount to add it to the draft .'},
    {step:3,text:'Show 👌 to add into ingredients'},
    {step:4,text:'Show ✋ to remove an ingredient'},
    {step:5,text:'Select from Suggested Recipes'}

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

  const fetchData = useCallback(()=>{
      axios.get('https://api.spoonacular.com/recipes/findByIngredients?ingredients=apples,+banana,+sugar&number=4',{ headers: { 'x-api-key': 'f0a27ba528854325870889a12fa44014'}})
    .then(function (response) {
      setReceipes(racipes=>[
        ...recipes,
        ...response.data.map((data)=>data)
      ])  
    })
    .catch(function (error) {
      console.log(error);
    });
  },[rawingredients]);

  

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
          fpg.Gestures.raisedHandGesture
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map(
            (prediction) => prediction.score
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          if(gesture.gestures[maxConfidence].score>7.5 && gesture.gestures[maxConfidence].name === 'ok'){
             setOkGesture(true);
          }
          else if(gesture.gestures[maxConfidence].score>7.5 && gesture.gestures[maxConfidence].name === 'raised_hand'){
              setRemoveGesture(true);
          }
        }
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  


  useEffect(()=>{runCoco()},[]);
  useEffect(()=>{runHandpose()},[]);

  useEffect(()=>{ if(transcript ){setDraft(item+" "+transcript)};setOkGesture(false);setRemoveGesture(false)},[transcript])
  useEffect(()=>
   { 
            if(removegesture === true && ingredients.includes(latestItem)){
              setIngredients(ingredients.filter(item => item !== latestItem));
              setRawIngredients(rawingredients.filter(item => item !== rawingredients.slice(-1)[0]))
              console.log(ingredients.slice(-2)[0])
              console.log(rawingredients)
              setLatestItem();
              setReceipes([])
              setRemoveGesture(false)
            }
    },[removegesture]);
  useEffect(()=>
  {
    if(okgesture === true && draft){
    setIngredients([...ingredients,draft]);
    setRawIngredients([...rawingredients,item]);
    console.log(rawingredients)
    fetchData();
    setLatestItem(draft);
    setItem();
    setDraft();
    setOkGesture(false)}},[okgesture]);
  




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
               style={{color: '#B34D2D',marginTop:'20px',textAlign:'start'}} >
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
     <div style={{margin:'30px',display:'flex',flexDirection:'column',alignItems:'start'}}>
     {recipes.length !== 0 && <div style={{color:'#B34D2D',fontSize:'20px',marginLeft:20}}>Suggested Recipes</div>}
     <div style={{display:'flex',flexDirection:'row',marginTop:20}}>
     {recipes.map((recipe)=>
      <Card
      style={{ width: 200,marginLeft:20 }}
      cover={
        <img
          alt={recipe.title}
          src={recipe.image}
        />
      }
      actions={[
      <div><PlusOutlined key="select" /></div>,
      <Popconfirm title="Missing Ingredients" 
       description= {recipe.missedIngredients.map((data)=>data.name)}
       showCancel={false}
       okButtonProps={{style:{display:'none'}}}
       icon={<></>}><div><BulbOutlined key="missing"/></div>
      </Popconfirm>
             
      ]}
    >
    <Meta
      title={recipe.title}
    />
  </Card>)}
     </div>
     </div>
    </div>
  );
}

export default App;
