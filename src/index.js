import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import NextStep from './NextStep';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path:"/step-1",
    element: <NextStep />
  }
]);

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById('root')
);