import User from "../models/user.js";

export const renderSignupForm = (req, res) => {
  res.render("users/signUp.ejs");
};

export const signupUser = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    // console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "welcome to wonderlust!!");
      res.redirect("/listing");
    });
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/user/signup");
  }
};

export const renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

export const loginUser = async (req, res) => {
  req.flash("success", "welcome back to wonderlust");
  let redirect = res.locals.redirectUrl || "/listing";
  res.redirect(redirect);
};

export const logoutUser = async (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you have logged out!!");
    res.redirect("/listing");
  });
};
