import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Layout } from './components/layout/layout';
import SocketIO from "socket.io-client";
import { Config } from './config';

export const socket = SocketIO.connect(Config.serverUrl);
export const getAxiosConfig = () => {
  return {
    withCredentials: true,
    headers: {
      authorization: "Bearer " + sessionStorage.getItem("token")
    }
  }
}
export const isAdmin = () => {
  return {
    withCredentials: true,
    headers: {
      authorization: "Bearer " + sessionStorage.getItem("token2")
    }
  }
}
ReactDOM.render(
  <React.StrictMode>
    <Layout />
  </React.StrictMode>,
  document.getElementById('root')
);
serviceWorker.unregister();
