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
import {web3FromSource} from "@polkadot/extension-dapp";
import utils from "../substrate-lib/utils";

function Main (props) {
  const {label, type, attrs, handlerEvent} = props
  const { api, currentAccount } = useSubstrateState();
  const {apollo_client, gql, puzzleSets: {pubRefresh, updatePubRefresh, tryToPollCheck} } = useAtoContext()
  // 0 == nothing, 1 = ok , 2= failed, 3=loading
  const [callStatus, setCallStatus] = useState(0)

  const statusCallBack = (codeNum) => {
    setCallStatus(codeNum)
  }

  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected }
    } = currentAccount;
    let fromAcct;
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = address;
      api.setSigner(injected.signer);
    } else {
      fromAcct = null;
    }
    return fromAcct;
  };

  const isNumType = type =>
    utils.paramConversion.num.some(el => type.indexOf(el) >= 0)

  const transformParams = (
    paramFields,
    inputParams,
    opts = { emptyAsNull: true }
  ) => {
    // if `opts.emptyAsNull` is true, empty param value will be added to res as `null`.
    //   Otherwise, it will not be added
    const paramVal = inputParams.map(inputParam => {
      // To cater the js quirk that `null` is a type of `object`.
      if (
        typeof inputParam === 'object' &&
        inputParam !== null &&
        typeof inputParam.value === 'string'
      ) {
        return inputParam.value.trim()
      } else if (typeof inputParam === 'string') {
        return inputParam.trim()
      }
      return inputParam
    })
    const params = paramFields.map((field, ind) => ({
      ...field,
      value: paramVal[ind] || null,
    }))

    return params.reduce((memo, { type = 'string', value }) => {
      if (value == null || value === '')
        return opts.emptyAsNull ? [...memo, null] : memo

      let converted = value

      // Deal with a vector
      if (type.indexOf('Vec<') >= 0) {
        converted = converted.split(',').map(e => e.trim())
        converted = converted.map(single =>
          isNumType(type)
            ? single.indexOf('.') >= 0
            ? Number.parseFloat(single)
            : Number.parseInt(single)
            : single
        )
        return [...memo, converted]
      }

      // Deal with a single value
      if (isNumType(type)) {
        converted =
          converted.indexOf('.') >= 0
            ? Number.parseFloat(converted)
            : Number.parseInt(converted)
      }
      return [...memo, converted]
    }, [])
  }

  async function doClick() {
    console.log(attrs)
    const fromAcct = await getFromAcct();

    const {palletRpc, callable, inputParams, paramFields} = attrs

    const transformed = transformParams(paramFields, inputParams, {
      emptyAsNull: false,
    })

    const txExecute = attrs
      ? api.tx[palletRpc][callable](...transformed)
      : api.tx[palletRpc][callable]()

    const unsub = await txExecute
      .signAndSend(fromAcct, {}, ({events = [], status}) => {
        // console.log('Transaction status:', status.type);
        if (status.isInBlock) {
          // console.log('Included at block hash', status.asInBlock.toHex());
          // console.log('Events:');
          statusCallBack(3)
          events.forEach(({event: {data, method, section}, phase}) => {
            handlerEvent(section, method, statusCallBack)
          });
        } else if (status.isFinalized) {
          console.log("RUN finalized.")
        }
      })
  }

    // Puzzle information.
    useEffect(async () => {

    }, [callStatus, setCallStatus]);

  return (
      <>
        <Button onClick={()=>doClick()}>{label}</Button>
        <span>
          {callStatus?callStatus == 1?"Transaction successed":
                      callStatus == 2?"Transaction failed":callStatus == 3?"Submitting":"**":"*"}
        </span>
      </>
  );
}

export default function KButton (props) {
    const { api } = useSubstrateState();
    return api.query
        ? <Main {...props} />
        : null;
}
