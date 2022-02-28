import React, { useEffect, useState } from 'react';
import sha256 from 'sha256';
import {Form, Input, Grid, Card, Statistic, TextArea, Label, Button, Table} from 'semantic-ui-react';
import config from '../config';
import axios from "axios";
import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import PuzzleList from "./PuzzleList";
import {gql} from "@apollo/client";
import StepCase from "../Step/StepCase";

import {
    useParams
} from "react-router-dom";
import PuzzleAnswer from "./PuzzleAnswer";
import AnswerList from "./AnswerList";
import ChallengeList from "./ChallengeList";

function Main (props) {
    const {apollo_client, gpl} = props;
    let {puzzle_hash} = useParams();
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
  }, [setPuzzleInfo]);

  return (
      <div>
          <Grid.Row>
              <h2>Title: [{puzzleInfo?puzzleInfo.puzzle_title:'*'}]</h2>
              {puzzleInfo?puzzleInfo.puzzle_content.map((body, idx) => <div key={idx}>
                  {body.type?body.type === 'text'?
                      <h3>TextContent:[{body.data}]</h3>:body.type === 'file'?
                        <img src={body.data} style={{width: 500}} />:'*':'*'}
              </div>):'*'}
          </Grid.Row>
          <Grid.Row>
              <h2>>> Solve it</h2>
              <div>Be the first one to submit a matched answer...</div>
              <AnswerList puzzle_hash={puzzle_hash} apollo_client={apollo_client} gql={gql}  />
          </Grid.Row>
          <Grid.Row>
              <hr/>
          </Grid.Row>
          <Grid.Row>
              <h2>>> Challenge it</h2>
              <div>if you think the matched answer is not appropriate.</div>
              <ChallengeList puzzle_hash={puzzle_hash} apollo_client={apollo_client} gql={gql}  />
          </Grid.Row>
      </div>
  );
}

export default function PuzzleDetail (props) {
  return true
    ? <Main {...props} />
    : null;
}
