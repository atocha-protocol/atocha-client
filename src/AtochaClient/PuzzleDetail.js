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
import SponsorList from "./SponsorList";
import {useAtoContext} from "./AtoContext";
import {useSubstrateState} from "../substrate-lib";

function Main (props) {
    const {apollo_client, gql, puzzleSets: {pubRefresh} , chainData: {pubBlockNumber}, } = useAtoContext()
    const {puzzle_hash} = useParams();
    const request = `${config.ARWEAVE_EXPLORE}/${puzzle_hash}`;
    const [arweaveInfo, setArweaveInfo] = useState(null);
    const [puzzleInfo, setPuzzleInfo] = useState(null);
    const [depositInfo, setDepositInfo] = useState([]);
    const [matchAnswerBn, setMatchAnswerBn] = useState(BigInt(0));
    const [financeConfig, setFinanceConfig] = useState(null);

    // load json data.
    function loadJsonData() {
        axios.get(request, {}).then(function (response) {
            console.log(response.data);
          setArweaveInfo(response.data);
        }).catch(function (error) {
            console.log(error);
        });
    }

  async function loadMatchAnswerBn() {
    if (!puzzle_hash){
      return;
    }
    apollo_client.query({
      query: gql`
          query{
              answerCreatedEvents(filter:{
                  puzzleInfoId: {
                      equalTo: "${puzzle_hash}",
                  }
              }){
                  nodes{
                      id,
                      resultType,
                      eventBn
                  }
              }
          }
      `
    }).then(result => {
      if(result.data.answerCreatedEvents.nodes.length > 0) {
        for(const idx in result.data.answerCreatedEvents.nodes) {
          const answerData = result.data.answerCreatedEvents.nodes[idx]
          if(answerData.resultType == "ANSWER_HASH_IS_MATCH"){
            setMatchAnswerBn(BigInt(answerData.eventBn))
          }
        }
      }
    });
  }

    async function loadDepositInfo() {
      if (!puzzle_hash){
        return;
      }
      apollo_client.query({
        query: gql`
            query{
                puzzleDepositEvents(filter:{
                    puzzleInfoId: {
                        equalTo: "${puzzle_hash}"
                    }
                }){
                    nodes{
                        id,
                        whoId,
                        deposit,
                        eventBn,
                    }
                }
            }
        `
      }).then(result => {
        if(result.data.puzzleDepositEvents.nodes.length > 0) {
          // console.log("result.puzzleCreatedEvents. = ",result.data.puzzleCreatedEvents.nodes[0].eventBn ); // puzzle-onchain infos
          setDepositInfo(result.data.puzzleDepositEvents.nodes);
        }
      });
    }

    async function loadPuzzleInfoOnChain() {
      if (!puzzle_hash){
        return;
      }
      apollo_client.query({
        query: gql`
            query{
                puzzleCreatedEvents (
                    filter:{
                        puzzleHash:{
                            equalTo:"${puzzle_hash}"
                        }
                    }
                ) {
                    nodes{
                        id,
                        whoId,
                        puzzleHash,
                        eventBn,
                        dynPuzzleStatus,
                        dynChallengeStatus,
                        dynRaiseDeadline,
                        dynTotalDeposit,
                        dynHaveMatchedAnswer,
                        dynChallengeDeadline,
                        dynRaiseDeadline,
                    }
                }
            }
        `
      }).then(result => {
        if(result.data.puzzleCreatedEvents.nodes.length == 1) {
          // console.log("result.puzzleCreatedEvents. = ",result.data.puzzleCreatedEvents.nodes[0].eventBn ); // puzzle-onchain infos
          setPuzzleInfo(result.data.puzzleCreatedEvents.nodes[0]);
        }
      });
    }

    function getPuzzleStatus(infoObj) {
      console.log("pubBlockNumber = ", pubBlockNumber, `infoObj.dynHaveMatchedAnswer = ${infoObj.dynHaveMatchedAnswer}`);
      console.log(`${BigInt(infoObj.dynChallengeDeadline)} > ${BigInt(pubBlockNumber)} || ${BigInt(infoObj.dynRaiseDeadline)} > ${BigInt(pubBlockNumber)}`)
      if(infoObj.dynHaveMatchedAnswer == false) {
        return "UNSOLVED"
      }else if(
        infoObj.dynHaveMatchedAnswer == true &&
        ( BigInt(infoObj.dynChallengeDeadline) > BigInt(pubBlockNumber) || BigInt(infoObj.dynRaiseDeadline) > BigInt(pubBlockNumber) )  &&
        infoObj.dynChallengeStatus == "Raise"
      ) {
        return "CHALLENGABLE"
      }else if (
        ( infoObj.dynPuzzleStatus == "PUZZLE_STATUS_IS_FINAL" && infoObj.dynChallengeStatus != "JudgePassed" ) ||
        ( infoObj.dynChallengeStatus == "JudgeRejected" ) ||
        ( infoObj.dynChallengeStatus == "RaiseFundsBack" ) ||
        ( infoObj.dynPuzzleStatus == "PUZZLE_STATUS_IS_SOLVED" &&  infoObj.dynRaiseDeadline == 0 &&  BigInt(infoObj.dynChallengeDeadline) < BigInt(pubBlockNumber) ) ||
        ( infoObj.dynPuzzleStatus == "PUZZLE_STATUS_IS_SOLVED" &&  infoObj.dynChallengeStatus == "Raise" && BigInt(infoObj.dynRaiseDeadline) > BigInt(0) && BigInt(infoObj.dynRaiseDeadline) < BigInt(pubBlockNumber) )
      ) {
        return "SOLVED"
      } else if ( infoObj.dynChallengeStatus == "JudgePassed" ) {
        return "INVALID"
      }else if ( infoObj.dynChallengeStatus == "RaiseCompleted" ) {
        return "JUDGING"
      }
      return "Error status."
    }

    function getEstimatedPoints(infoObj, preBn) {

      if( parseInt(preBn) <= 0) {
        return "System parameter error!"
      }

      if(depositInfo.length == 0 || !infoObj){
        return "*"
      }

      if(infoObj.dynPuzzleStatus == "PUZZLE_STATUS_IS_FINAL") {
        return "Points have been claimed!"
      }

      let finalPointBn = pubBlockNumber
      if(infoObj.dynHaveMatchedAnswer == true) {
        finalPointBn = matchAnswerBn
      }

      let sumPoint = BigInt(0);
      for( const idx in depositInfo ) {
        // deposit: "300000000000000000000"
        // eventBn: "454081"
        // id: "454081-3"
        // whoId: "5Dth1UgcLMRYFyv6ykLTwmCpZC45uL1bmJ7S7uEvfLdu8y3f"
        const sponsorData = depositInfo[idx]
        const diff = BigInt(finalPointBn) - BigInt(sponsorData.eventBn)
        const pointNum = diff * BigInt(1000) / BigInt(preBn) / BigInt(1000)
        sumPoint+=pointNum
      }
      console.log("sumPoint = ", sumPoint)
      return sumPoint.toString()
    }

    // Puzzle information.
    useEffect(async () => {
        if(arweaveInfo===null) {
            loadJsonData();
        }
        // atochaFinance.atoConfig2
        if(financeConfig == null) {
          const conf1 = await api.query.atochaFinance.atoConfig2()
          setFinanceConfig(conf1.toJSON());
        }
        loadPuzzleInfoOnChain()
        loadDepositInfo()
        loadMatchAnswerBn()
    }, [setArweaveInfo, setPuzzleInfo, pubRefresh]);

  return (
      <div>
          <Grid.Row>
              <h2>Title: [{arweaveInfo?arweaveInfo.puzzle_title:'*'}][{pubRefresh}]</h2>
              {arweaveInfo?arweaveInfo.puzzle_content.map((body, idx) => <div key={idx}>
                  {body.type?body.type === 'text'?
                      <h3>TextContent:[{body.data}]</h3>:body.type === 'file'?
                        <img src={body.data} style={{width: 500}} />:'*':'*'}
              </div>):'*'}
          </Grid.Row>
          <Grid.Row>
            <div>Creater: {puzzleInfo?.puzzleHash}</div>
            <div>Create bn: {puzzleInfo?.eventBn} CurrentBn: {pubBlockNumber}</div>
            <div>Total deposit: {puzzleInfo?.dynTotalDeposit}</div>
            <div>Puzzle status: {puzzleInfo?getPuzzleStatus(puzzleInfo):'*'}</div>
            <div>Estimated points: {puzzleInfo?getEstimatedPoints(puzzleInfo, financeConfig?financeConfig.pointRewardEpochBlockLength:0):'*'}</div>
          </Grid.Row>
          <Grid.Row>
              <h2>>> Solve it</h2>
              <div>Be the first one to submit a matched answer...</div>
              <AnswerList puzzle_hash={puzzle_hash} />
          </Grid.Row>
          <Grid.Row>
              <hr/>
          </Grid.Row>
          <Grid.Row>
              <h2>>> Sponsor it</h2>
              <div>.</div>
              <SponsorList puzzle_hash={puzzle_hash} />
          </Grid.Row>
          <Grid.Row>
              <hr/>
          </Grid.Row>
          <Grid.Row>
              <h2>>> Challenge it</h2>
              <div>if you think the matched answer is not appropriate.</div>
              <ChallengeList puzzle_hash={puzzle_hash} />
          </Grid.Row>
      </div>
  );
}

export default function PuzzleDetail (props) {
    const { api } = useSubstrateState();
    const { apollo_client, gql } = useAtoContext()
    return api.query && apollo_client && gql
        ? <Main {...props} />
        : null;
}
