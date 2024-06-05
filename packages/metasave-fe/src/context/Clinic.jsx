// contexts/ClinicAuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react'
import { Web3Auth } from '@web3auth/modal'
import { WALLET_ADAPTERS } from '@web3auth/base'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'

const ClinicAuthContext = createContext()

export const ClinicAuthContextProvider = ({ children }) => {
  const [web3auth, setWeb3Auth] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)

  const initWeb3Auth = async () => {
    const sepoliaChainConfig = {
      chainNamespace: 'eip155',
      chainId: '0xaa36a7',
      rpcTarget: 'https://rpc.ankr.com/eth_sepolia',
      displayName: 'Ethereum Sepolia Testnet',
      blockExplorerUrl: 'https://sepolia.etherscan.io',
      ticker: 'ETH',
      tickerName: 'Ethereum',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    }

    const privateKeyProvider = new EthereumPrivateKeyProvider({
      config: {
        chainConfig: sepoliaChainConfig,
      },
    })

    const web3auth = new Web3Auth({
      clientId:
        'BJGWO2abSqntJyXgPZwpAZH9-BdnaoY_w6VFpeo-OVzyZaVMIt8F8lxodXXGU0wCmtARzvgsTbP6cdEGOiBznxI',
      web3AuthNetwork: 'sapphire_devnet',
      chainConfig: sepoliaChainConfig,
    })

    const openloginAdapter = new OpenloginAdapter({
      adapterSettings: {
        loginConfig: {
          google: {
            name: 'Google Login',
            verifier: 'metasave-google',
            typeOfLogin: 'google',
            clientId:
              '812141797831-m3vq0ll82e23vsgu0ns700l1b2etoagf.apps.googleusercontent.com',
          },
        },
      },
      privateKeyProvider,
    })

    web3auth.configureAdapter(openloginAdapter)

    await web3auth.initModal()

    setWeb3Auth(web3auth)

    await checkLoggedIn(web3auth)
  }

  const login = async () => {
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: 'google',
      }
    )
    setLoggedIn(true)
    window.location.replace('/clinic/dashboard')
  }

  const logout = async () => {
    if (web3auth) {
      await web3auth.logout()
      setLoggedIn(false)
      window.location.replace('/clinic/signin')
    }
  }

  const checkLoggedIn = async (web3auth) => {
    if (web3auth?.status === 'connected') {
      setLoggedIn(true)
    }
  }

  useEffect(() => {
    initWeb3Auth()
  }, [])

  return (
    <ClinicAuthContext.Provider
      value={{
        web3auth,
        loggedIn,
        login,
        logout,
      }}
    >
      {children}
    </ClinicAuthContext.Provider>
  )
}

export const useClinicAuthContext = () => useContext(ClinicAuthContext)
