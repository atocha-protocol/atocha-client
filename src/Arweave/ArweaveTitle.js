import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button, Table} from 'semantic-ui-react';
import config from '../config';
import axios from "axios";

function Main (props) {
  const { puzzle_hash } = props;

  // Request url: http://148.72.247.143:1984/FvpwVOX3o7gkWD0Nu1G7LOhYDBpqoAuP06BaWbfgXj4
  let request = `${config.ARWEAVE_EXPLORE}/${puzzle_hash}`;
  let [puzzleInfo, setPuzzleInfo] = useState(null);

  // load json data.
  function loadJsonData() {
    axios.get(request, {}).then(function (response) {
      console.log(response.data);
      setPuzzleInfo(response.data);
    }).catch(function (error) {
      console.log(error);
    });
  }

  // Puzzle information.
  useEffect(async () => {
    if(puzzleInfo===null) {
      loadJsonData();
    }
  }, [puzzleInfo]);

  return (
    <span><a href={`${request}`} target="_blank">{puzzleInfo?puzzleInfo.puzzle_title:'*'}</a></span>
  );
}

export default function ArweaveTitle (props) {
  return true
    ? <Main {...props} />
    : null;
}
