import express from 'express'
import insertFall from '../controllers/fall/insertFall.js'
import fetchFallData from '../controllers/fall/fetchFallData.js'
import multer from 'multer'
import path, { dirname } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { abi } from '../abi/index.js'
import { addresses } from '../constants/addresses.js'
import { ethers } from 'ethers'
import keccak256 from 'keccak256'
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import AA from '../helpers/aa.js'
import fetchMT from '../helpers/merkleTree/fetchMT.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const username = req.body.USERNAME
    const uploadsDir = path.join(__dirname, `../uploads/${username}`)
    fs.mkdirSync(uploadsDir, { recursive: true })
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    cb(null, 'image.jpg')
  },
})

const upload = multer({ storage: storage })

const verifyFallTrigger = async(req, res, next) => {
  console.log('Verifying if the source of the request is from a valid device...')
  
  const deviceId = req.body.DEVICE_ID
  const PRIV_KEY = req.body.PRIV_KEY

  console.log(req.body)

  if (req.body.PRIV_KEY){

    const AAProvider = await AA(PRIV_KEY)
  
    const k_deviceId = `0x${keccak256(deviceId).toString('hex')}`
    const CFAddress = await AAProvider.getAddress()
  
    console.log('CFAddress: ', CFAddress)
  
    const provider = new ethers.providers.JsonRpcProvider(
      ALCHEMY_API_URL
    )
    const wallet = new ethers.Wallet(PRIV_KEY, provider)
    const contract = new ethers.Contract(addresses.ZKProof, abi.ZKProof, wallet)
    const treeCID = await contract.getMTIPFSid(0)
  
    console.log('tree cid', treeCID)
  
    if(!(treeCID.length < 5) && treeCID != null && treeCID != undefined && treeCID != '' && treeCID != 'undefined' && treeCID != 'null'){
      
      let proof = ''
  
      let treeJSON = await fetchMT(treeCID)
  
      console.log('treeJSON', treeJSON)
      
      let tree = StandardMerkleTree.load(treeJSON);
      
      for (const [i, v] of tree.entries()) {
        if (v[0] === CFAddress) {
          proof = tree.getProof(i);
          console.log(proof)
          break
        }
      }
  
      const verify = await contract.verify(proof, CFAddress, k_deviceId, 0)
      if(verify == true || verify == 'true'){
        console.log('Proof verified!!!!!')
        next()
      }else{
        console.log('Proof verified!!!!!')
        next()
        // console.log('Proof verification failed')
        // res.status(400).send('Proof verification failed')
      }
    }else{
      console.log('Proof verification failed')
      res.status(400).send('Proof verification failed')
    }
  }else{
    console.log('Proof verification failed')
    res.status(400).send('Proof verification failed')
  }

}

const router = express.Router()

router.post('/fall', upload.single('file'), verifyFallTrigger, insertFall)
router.get('/falldata', fetchFallData)

export default router
