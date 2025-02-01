"use client";

import Image from "next/image";
import { useReducer } from "react";
import { formatUnits } from "viem";
import { arbitrum, base } from "viem/chains";
import { swapReducer } from "@/reducers";
import { Header } from "@/components/header";
import { useDebounce, useSwapPrice } from "@/hooks";
import {
  BASE_TOKENS_BY_ADDRESS,
  TOKEN_MAPS_BY_CHAIN_ID,
  TOKENS_BY_CHAIN_ID,
} from "@/constants";

export default function Home() {
  const [state, dispatch] = useReducer(swapReducer, {
    sellToken:
      BASE_TOKENS_BY_ADDRESS["0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"],
    buyToken:
      BASE_TOKENS_BY_ADDRESS["0x4200000000000000000000000000000000000006"],
    inputAmount: "",
    shouldDebounce: true,
    chainId: base.id,
  });

  const { inputAmount, shouldDebounce } = state;

  const debouncedInputAmount = useDebounce({
    value: inputAmount,
    enabled: shouldDebounce,
  });

  const sellAmount = shouldDebounce ? debouncedInputAmount : inputAmount;

  const { data, error, isFetching } = useSwapPrice({
    sellAmount,
    slippageBps: 50,
    chainId: state.chainId,
    sellToken: state.sellToken,
    buyToken: state.buyToken,
  });

  const outputAmount = data?.buyAmount
    ? formatUnits(BigInt(data.buyAmount), state.buyToken.decimals)
    : "";

  const tokenMapsByChainId = TOKEN_MAPS_BY_CHAIN_ID[state.chainId];

  return (
    <>
      <Header />
      <section className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="sr-only">Swap Tokens</h1>
          <form>
            <div className="flex mb-2 justify-end">
              <div>
                <label
                  htmlFor="chain-selector"
                  className="block mb-2 text-sm font-medium text-gray-900 sr-only"
                >
                  select a chain
                </label>
                <select
                  id="chain-selector"
                  value={state.chainId}
                  className="py-1 px-2 rounded-md"
                  onChange={(e) => {
                    dispatch({
                      type: "select chain",
                      payload: Number(e.target.value),
                    });
                  }}
                >
                  {[base, arbitrum].map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <label
                htmlFor="input-amount"
                className="font-semibold flex items-center"
              >
                <span className="text-2xl mr-2">Sell</span>
                <Image
                  priority
                  width={25}
                  height={25}
                  src={state.sellToken.logo}
                  className="inline-block mr-2"
                  alt={`${state.sellToken.symbol} logo`}
                />
              </label>
              <div>
                <label
                  htmlFor="sell-token"
                  className="block mb-2 text-sm font-medium text-gray-900 sr-only"
                >
                  select a sell token
                </label>
                <select
                  id="sell-token"
                  value={state.sellToken.address}
                  className="py-1 px-2 rounded-md"
                  onChange={(e) => {
                    dispatch({
                      type: "select sell token",
                      payload: tokenMapsByChainId[e.target.value],
                    });
                  }}
                >
                  {TOKENS_BY_CHAIN_ID[state.chainId].map((option) => (
                    <option key={option.address} value={option.address}>
                      {option.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <input
              type="text"
              id="input-amount"
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              inputMode="decimal"
              value={inputAmount}
              placeholder="Enter amount"
              pattern="^[0-9]*[.,]?[0-9]*$"
              className="text-lg w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onChange={(e) => {
                if (e.target.validity.valid) {
                  dispatch({
                    type: "type sell amount",
                    payload: e.target.value,
                  });
                }
              }}
            />
            <div
              aria-live="polite"
              className="h-6 mt-2 mb-6 text-sm text-gray-300"
            >
              {error ? (
                <p className="text-red-500">{error.message}</p>
              ) : isFetching ? (
                "Finding best price…"
              ) : null}
            </div>
            <div className="flex items-center">
              <label
                htmlFor="sell-amount"
                className="font-semibold flex items-center"
              >
                <span className="text-2xl mr-2">Buy</span>

                <Image
                  priority
                  width={25}
                  height={25}
                  src={state.buyToken.logo}
                  className="inline-block mr-2"
                  alt={`${state.buyToken.symbol} logo`}
                />
              </label>
              <div>
                <label
                  htmlFor="buy-token"
                  className="block mb-2 text-sm font-medium text-gray-900 sr-only"
                >
                  select a buy token
                </label>
                <select
                  id="buy-token"
                  value={state.buyToken.address}
                  className="py-1 px-2 rounded-md"
                  onChange={(e) => {
                    dispatch({
                      type: "select buy token",
                      payload: tokenMapsByChainId[e.target.value],
                    });
                  }}
                >
                  {TOKENS_BY_CHAIN_ID[state.chainId].map((option) => (
                    <option key={option.address} value={option.address}>
                      {option.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <input
              disabled
              id="sell-amount"
              value={outputAmount}
              className="mt-2 text-lg w-full p-3 rounded-md cursor-not-allowed border-none mb-4 disabled:bg-gray-500 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled={isFetching}
              onClick={() => {
                dispatch({ type: "toggle direction", payload: outputAmount });
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-300"
            >
              Switch Trade Directions
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
