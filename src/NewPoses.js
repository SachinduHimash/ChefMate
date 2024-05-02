import {Finger,FingerCurl,FingerDirection,GestureDescription} from 'fingerpose'


export const oneGesture = new GestureDescription('one-gesture');


oneGesture.addCurl(Finger.Index,FingerCurl.NoCurl,1.0);

oneGesture.addCurl(Finger.Middle,FingerCurl.FullCurl,1.0);
oneGesture.addCurl(Finger.Ring,FingerCurl.FullCurl,1.0);
oneGesture.addCurl(Finger.Pinky,FingerCurl.FullCurl,1.0);
oneGesture.addCurl(Finger.Thumb,FingerCurl.FullCurl,1.0);

oneGesture.addDirection(Finger.Index,FingerDirection.VerticalUp,0.25);
oneGesture.addDirection(Finger.Index,FingerDirection.DiagonalUpLeft,0.25);
oneGesture.addDirection(Finger.Index,FingerDirection.DiagonalUpRight,0.25);

oneGesture.addDirection(Finger.Thumb,FingerDirection.HorizontalLeft,0.25);
oneGesture.addDirection(Finger.Thumb,FingerDirection.HorizontalRight,0.25);



export const fourGesture = new GestureDescription('four-gesture');

for(let finger of [Finger.Index,Finger.Middle,Finger.Ring,Finger.Pinky]){
   fourGesture.addCurl(finger,FingerCurl.NoCurl,1.0);
   fourGesture.addDirection(finger,FingerDirection.VerticalUp,0.25);
   oneGesture.addDirection(finger,FingerDirection.DiagonalUpLeft,0.25);
   oneGesture.addDirection(finger,FingerDirection.DiagonalUpRight,0.25);

}

fourGesture.addCurl(Finger.Thumb,FingerCurl.HalfCurl,0.75);
fourGesture.addDirection(Finger.Thumb,FingerDirection.HorizontalLeft,0.25);
fourGesture.addDirection(Finger.Thumb,FingerDirection.HorizontalRight,0.25);
