const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      "Secret Passphrase"
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json("err");
  }
});

//LOGIN

router.post('/login', async (req, res) => {

    try{
        const user = await User.findOne(
            {
                username: req.body.username
            }
        );
        
      
        
        if(!user){
          return  res.status(500).json("Wrong User Name");
        }
        const hashedPassword = CryptoJS.AES.decrypt(
            user.password,
            "Secret Passphrase"
        );


        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        const inputPassword = req.body.password;

        if(originalPassword != inputPassword) { return res.status(401).json("Wrong Password");}
            

        const accessToken = jwt.sign(
        {
            id: user._id,
            isAdmin: user.isAdmin,
        },
        "Secret Authphrase",
            {expiresIn:"3d"}
        );
        const { password, ...others } = user._doc ;  
       
        res.status(200).json({...others, accessToken});

    }catch(err){
        res.status(500).json("Wrong Password or Username");
    }

});

module.exports = router;
