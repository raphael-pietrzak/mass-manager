#!/bin/bash
# start.sh
npm install
npm run migrate
npm run seed
npm start