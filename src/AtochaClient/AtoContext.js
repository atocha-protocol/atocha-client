import React, {createContext, useContext, useEffect, useReducer, useState} from "react";

import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    useQuery,
    gql
} from "@apollo/client";

import config from "../config";
import {useSubstrateState} from "../substrate-lib";

const AtoContext = createContext(null)

const AtoContextProvider = props => {
    const { apiState, apiError, keyringState, api } = useSubstrateState()

    const [helloWorld, setHelloWorld] = useState('None--')
    const [pubPuzzleList, setPubPuzzleList] = useState([])
    const [pubPuzzleListType, setPubPuzzleListType] = useState('UNSOLVED')
    const [pubBlockNumber, setPubBlockNumber] = useState(0)
    const [rewardRankList, setRewardRankList] = useState([])

    const apollo_client = new ApolloClient({
        uri: config.SUBQUERY_HTTP,
        cache: new InMemoryCache()
    });

    async function loadPuzlleList() {
        console.log('pubPuzzleListType = ', pubPuzzleListType);
        const filter_UNSOLVED = `
            filter: {
                dynHaveMatchedAnswer:{
                  equalTo: false
                }
            }
        `
        const filter_CHALLENGABLE = `
        filter: {
            dynHaveMatchedAnswer:{
              equalTo: true,
            },
            or:[
              {
                dynChallengeDeadline:{
                greaterThan: "${pubBlockNumber}",
                },
              },{
                dynRaiseDeadline:{
                greaterThan: "${pubBlockNumber}"
              }
              }
            ],
            dynChallengeStatus:{
              equalTo: "Raise"
            }
          }
        `

        const filter_SOLVED = `
            filter: {
                or:[
                  {
                    dynPuzzleStatus:{
                      equalTo: "PUZZLE_STATUS_IS_FINAL"
                    },
                    dynChallengeStatus:{
                      notEqualTo: "JudgePassed"
                    }
                  },
                  {
                    dynChallengeStatus:{
                      equalTo: "JudgeRejected"
                    }
                  },
                  {
                    dynChallengeStatus:{
                      equalTo: "RaiseFundsBack"
                    }
                  },
                  {
                    dynPuzzleStatus:{
                      equalTo: "PUZZLE_STATUS_IS_SOLVED"
                    },
                    dynRaiseDeadline: {
                      equalTo: "0"
                    },
                    dynChallengeDeadline: {
                      lessThan: "${pubBlockNumber}"
                    }
                  },
                  {
                    dynPuzzleStatus:{
                      equalTo: "PUZZLE_STATUS_IS_SOLVED"
                    },
                    dynChallengeStatus: {
                      equalTo: "Raise"
                    },
                    dynRaiseDeadline: {
                      greaterThan: "0"
                    },
                    and: [
                      {
                        dynRaiseDeadline: {
                          lessThan: "${pubBlockNumber}"
                        }
                      }
                    ]
                  }
                ]
              }
        `

        const filter_INVALID = `
            filter: {
                dynChallengeStatus:{
                    equalTo:"JudgePassed"
                }
            }
        `

        const filter_JUDGING = `
            filter: {
                dynChallengeStatus:{
                    equalTo:"RaiseCompleted"
                }
            }
        `

        let filter_result = filter_UNSOLVED
        switch (pubPuzzleListType) {
            case 'UNSOLVED':
                filter_result = filter_UNSOLVED;
                break;
            case 'CHALLENGABLE':
                filter_result = filter_CHALLENGABLE;
                break;
            case 'SOLVED':
                filter_result = filter_SOLVED;
                break;
            case 'JUDGING':
                filter_result = filter_JUDGING;
                break;
            case 'INVALID':
                filter_result = filter_INVALID;
                break;
        }

        apollo_client.query({
            query: gql`
                query{
                    puzzleCreatedEvents(last:1000,orderBy:EVENT_BN_DESC, ${filter_result}){
                        nodes{
                            whoId,
                            puzzleHash,
                            createBn,
                            eventBn,
                            eventHash,
                            dynRaiseDeadline,
                            dynChallengeDeadline,
                            dynPuzzleStatus,
                            dynHaveMatchedAnswer,
                            dynChallengeStatus,
                            dynTotalDeposit,
                            ref_challenge_infos{
                                totalCount
                            },
                            ref_challenge_status(orderBy:EVENT_BN_DESC){
                                totalCount,
                                nodes{
                                    challengeStatus
                                }
                            },
                            ref_answer_infos(orderBy:EVENT_BN_DESC){
                                totalCount,
                                nodes{
                                    answerContent,
                                    eventBn,
                                    resultType
                                }
                            }
                        }
                    }
                }
            `
        }).then(result => {
            setPubPuzzleList(result.data.puzzleCreatedEvents.nodes)
        });
    }


    useEffect(() => {
        if (apiState === 'READY' ) {
            let unsubscribeAll = null
            api.derive.chain.bestNumber(number => {
                setPubBlockNumber(number.toString().toLocaleString('en-US'))
            }).then(unsub => {
                unsubscribeAll = unsub
            }).catch(console.error)

            loadPuzlleList();
        }
    }, [apiState, pubPuzzleListType])

    return (
        <>
            <AtoContext.Provider value={{ helloWorld, apollo_client, gql,
                chainData: {pubBlockNumber},
                puzzleSets: {pubPuzzleList, setPubPuzzleList, setPubPuzzleListType}
            }}>
                {props.children}
            </AtoContext.Provider>
        </>
    )
}

const useAtoContext = () => useContext(AtoContext)
const useAtoContextState = () => useContext(AtoContext).state
export { AtoContextProvider, useAtoContextState, useAtoContext }