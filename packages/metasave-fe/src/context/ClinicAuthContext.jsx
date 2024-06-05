import React, { createContext, useState, useEffect } from 'react'
import { Web3Auth } from '@web3auth/modal'
import { WALLET_ADAPTERS } from '@web3auth/base'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider'
import axios from 'axios'
import { getWalletProvider } from '../helpers/walletProvider.js'
import { addresses } from '../constants/addresses.js'
import { abi } from '../abi/index.js'
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from '@alchemy/aa-accounts'
import { AlchemyProvider } from '@alchemy/aa-alchemy'
import { LocalAccountSigner } from '@alchemy/aa-core'
import { defineChain } from 'viem'
import { useMainContext } from './MainContext.jsx'
import keccak256 from 'keccak256'

const ClinicAuthContext = createContext()

const sepolia = defineChain({
  id: 11_155_111,
  name: 'Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.org'],
    },
    alchemy: {
      http: ['https://eth-sepolia.g.alchemy.com/v2'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io',
      apiUrl: 'https://api-sepolia.etherscan.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 751532,
    },
    ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' },
    ensUniversalResolver: {
      address: '0xc8Af999e38273D658BE1b921b88A9Ddf005769cC',
      blockCreated: 5_317_080,
    },
  },
  testnet: true,
})

export const ClinicAuthContextProvider = ({ children }) => {
  const [web3auth, setWeb3Auth] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [web3AuthProvider, setWeb3AuthProvider] = useState(null)
  const [walletAddress, setWalletAddress] = useState(null)
  const [walletProvider, setWalletProvider] = useState(null)
  const [AAProvider, setAAProvider] = useState(null)
  const [CFAddress, setCFAddress] = useState(null)
  const [privKey, setPrivKey] = useState(null)
  const { serverUrl } = useMainContext()

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

  useEffect(() => {
    initWeb3Auth()
  }, [])

  const initWeb3Auth = async () => {
    try {
      console.log('Initializing Web3Auth...')
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
      console.log('Web3Auth initialized:', web3auth)
      setWeb3Auth(web3auth)
      await checkLoggedIn(web3auth)
    } catch (error) {
      console.error('Error initializing Web3Auth:', error)
    }
  }

  const checkLoggedIn = async (web3auth) => {
    if (web3auth?.status === 'connected') {
      const web3AuthProvider = web3auth.provider
      const walletProvider = getWalletProvider(web3AuthProvider)
      const walletAddress = await walletProvider.getAddress()
      const priv_key =
        '232f51a0bc36bcc2fdd76b7bdc25da572cd75621dc1d91feed35d298fc13c3d4'

      setPrivKey(priv_key)
      setWalletProvider(walletProvider)
      setWalletAddress(walletAddress)
      setWeb3AuthProvider(web3AuthProvider)

      getCFAddress(priv_key)
      setLoggedIn(true)
    }
  }

  const login = async () => {
    const web3authProvider = await web3auth?.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: 'google',
      }
    )
    const walletProvider = getWalletProvider(web3authProvider)
    const walletAddress = await walletProvider.getAddress()
    const priv_key =
      '232f51a0bc36bcc2fdd76b7bdc25da572cd75621dc1d91feed35d298fc13c3d4'

    setWalletProvider(walletProvider)
    setWalletAddress(walletAddress)
    setWeb3AuthProvider(web3authProvider)
    setPrivKey(priv_key)

    const verify = await verifyProof(walletAddress, walletProvider)
    if (verify.proceed) {
      if (verify.newUser) {
        window.location.replace('clinic/profile')
      } else {
        setLoggedIn(web3auth?.status === 'connected')
        const CF = getCFAddress(priv_key)
        const MetaSave = await walletProvider.getContract(
          addresses.MetaSave,
          abi.MetaSave
        )
        const IPFSid = await MetaSave.getIPFSFileName(CF)
        if (!IPFSid) {
          window.location.replace('/clinic/signup')
        } else {
          window.location.replace('/clinic/dashboard')
        }
      }
    } else {
      await web3auth.logout()
    }
  }

  return (
    <ClinicAuthContext.Provider
      value={{
        web3auth,
        loggedIn,
        web3AuthProvider,
        walletAddress,
        walletProvider,
        AAProvider,
        CFAddress,
        privKey,
        login,
        setWeb3Auth,
      }}
    >
      {children}
    </ClinicAuthContext.Provider>
  )
}

export const useClinicAuthContext = () => React.useContext(ClinicAuthContext)
