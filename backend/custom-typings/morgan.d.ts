/// <reference path="../node_modules/@types/express/index.d.ts" />
import express = require('express');

declare module morgan {
  export default function(name: string): express.RequestHandler;
}