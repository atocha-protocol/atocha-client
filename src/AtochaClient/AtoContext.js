import React, {createContext, useContext, useEffect, useReducer, useState} from "react";

import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    useQuery,
    gql
} from "@apollo/client";

import config from "../config";

const AtoContext = createContext(null)

const AtoContextProvider = props => {
    const [helloWorld, setHelloWorld] = useState('None--')

    const apollo_client = new ApolloClient({
        uri: config.SUBQUERY_HTTP,
        cache: new InMemoryCache()
    });

    useEffect(() => {

    }, [])

    return (
        <>
            <AtoContext.Provider value={{ helloWorld, apollo_client, gql }}>
                {props.children}
            </AtoContext.Provider>
        </>

    )
}

const useAtoContext = () => useContext(AtoContext)
const useAtoContextState = () => useContext(AtoContext).state
export { AtoContextProvider, useAtoContextState, useAtoContext }