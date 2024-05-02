import React, { useRef, useState, useEffect } from "react";

import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./NextStep.css";
import { drawHand } from "./utilities";

import * as fp from "fingerpose";
import * as fpg from "fingerpose-gestures";

import { oneGesture , fourGesture } from "./NewPoses";
import logo from "./assets/ChefMate.png"
import { useLocation } from "react-router-dom";
import { CoffeeOutlined ,DashboardOutlined,ExperimentOutlined,NumberOutlined,PlusOutlined,SearchOutlined} from '@ant-design/icons';

import { Button } from "antd";


function NextStep() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const {state} = useLocation();
  const [selectedIngredient,setSelectedIngredient]= useState(null);
  const [selectedType,setSelectedType]= useState(null);
  const [ingredients,setIngredients]=useState([]);

  const [number, setNumber] = useState();

  const Types =[
    {type:'Cups',icon:<CoffeeOutlined />},
    {type:'Grams (x100g)',icon:<DashboardOutlined />},
    {type:'Grams (x50g)',icon:<DashboardOutlined />},
    {type:'Peices',icon:<NumberOutlined />},
    {type:'Mililitres (x50ml)',icon:<ExperimentOutlined />,number:50,unit:'ml'},
    {type:'Tbsp',icon:<SearchOutlined />},
    {type:'Tsp',icon:<SearchOutlined />}
  ]

  const PosesToNumber = [
    {pose:'one-gesture',number:1},
    {pose:'victory',number:2},
    {pose:'ok',number:3},
    {pose:'four-gesture',number:4},
    {pose:'raised_hand',number:5}
  ]

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
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

      // Make Detections
      const hand = await net.estimateHands(video);
      // console.log(hand);


      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          oneGesture,
          fp.Gestures.VictoryGesture,
          fpg.Gestures.okGesture,
          fourGesture,
          fpg.Gestures.raisedHandGesture,
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          console.log(gesture.gestures);

          const confidence = gesture.gestures.map(
            (prediction) => prediction.score
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          console.log(gesture.gestures[maxConfidence].name);
          PosesToNumber.forEach((item)=>{
            if(item.pose === gesture.gestures[maxConfidence].name){
                setNumber(item.number);
            }
          })
          
        }
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  const setFinalIngredients = () => {
    let tempVariable;
    if(selectedType === 'Grams (x100g)'){
        tempVariable = selectedIngredient+" "+ 100*number+'g';
    }
    else if(selectedType === 'Grams (x50g)'){
        tempVariable = selectedIngredient+" "+ 50*number+'g';
    }
    else if(selectedType === 'Mililitres (x50ml)'){
        tempVariable = selectedIngredient+" "+ 50*number+'ml';
    }
    else{
    tempVariable=selectedIngredient+" "+number+" "+selectedType;
    }
    console.log(tempVariable);
    setIngredients([...ingredients,tempVariable]);
    setSelectedIngredient(null);
    setSelectedType(null);
    setNumber(null);
  }

  useEffect(()=>{runHandpose()},[]);

  return (
        <div className="NextStep">
            <div className="Logo">
                <img src={logo} alt="Logo" style={{width:'10%'}} />
            </div>
            <div style={{height:500,width:300,position:'absolute',right:10,border:'2px solid #B34D2D',display:'flex',flexDirection:'column',textAlign:'center'}}>
                <div style={{color:'#B34D2D',fontSize:'20px'}}>Ingredients</div>
                    {ingredients.map((ingredient)=>
                        <div style={{color:'#B34D2D',marginTop:'30px'}} >{ingredient}</div>
                     )}
                 {state.length === ingredients.length &&  
                    <Button type="primary" 
                    style={{background:'#B34D2D',position:'absolute',bottom:0,width:'80%',margin:30}}>Set Instructions</Button>       
                 }

            </div>     
            <div style={{color:'#B34D2D',fontSize:'20px',margin:20,fontWeight:500}}>
                Input the amount of each ingredient.<br/> Select each ingredient and type of input.<br />
                Input the number with your fingers.       
            </div>
            <div style={{color:'#426B1F',fontSize:'20px',margin:20}}>
                Select the Ingredient     
            </div>
            {state.map((ingredient) =>
                selectedIngredient === ingredient ? 
                <Button
                    type="primary" 
                    style={{background:'#426B1F',width:'150px',marginRight:'20px'}} 
                >{ingredient}
                </Button>:     
                <Button 
                    style={{color:'#426B1F',borderColor:'#426B1F',marginRight:'20px',width:'150px'}} 
                    onClick={()=>{setSelectedIngredient(ingredient);setSelectedType(null)}} >{ingredient}
                 </Button>
                
            )}
            {selectedIngredient && 
                <div>
                    <div style={{color:'#426B1F',fontSize:'20px',margin:20}}>
                        Select the Type     
                    </div>
                    <div style={{width:800,transform:'translate(40%)'}}>
                    {Types.map((item)=>
                    selectedType === item.type?
                    <Button 
                        icon={item.icon} 
                        type="primary"
                        style={{background:'#426B1F',width:'150px',marginRight:'20px',marginTop:20}} >{item.type}</Button>:
                    <Button     
                        icon={item.icon} 
                        onClick={()=>setSelectedType(item.type)} 
                        style={{color:'#426B1F',borderColor:'#426B1F',marginRight:'20px',width:'150px',marginTop:20}}>{item.type}</Button>
                    )}
                    </div>
                </div>
            }



            {selectedType !== null ? (
                <div className="Canvas">
                    <Webcam
                    ref={webcamRef}
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
                        zindex: 9,
                        width: 640,
                        height: 480,
                    }}
                    />
                    
                    <Button 
                        icon={<PlusOutlined/>}
                        style={{color:'#426B1F',borderColor:'#426B1F',marginRight:'20px',width:'150px',marginTop:20}}
                        onClick={()=>setFinalIngredients()}>Add {number}</Button>
                </div>
            ):(
                ""
            )}
        
        </div>
    
  );
}

export default NextStep;
