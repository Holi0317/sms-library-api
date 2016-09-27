declare module morgan {
  import express = require('express');
  function logger(name: string): express.RequestHandler;
  export default logger
}
