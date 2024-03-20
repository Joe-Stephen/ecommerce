import { RequestHandler } from "express";

//model imports
import User from "../user/userModel";
import Cart from "../cart/cartModel";
import CartProducts from "../cart/cartProductsModel";

//importing DB queries
import DBQueries from "../services/dbQueries";
const dbQueries = new DBQueries();

export const getUserCart: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUser = req.body.user;
    const userWithCart: User | null | undefined =
      await dbQueries.findUserWithCartByEmail(loggedInUser.email);
    if (!userWithCart?.dataValues.Cart) {
      console.log("User cart is empty.");
      return res.status(400).json({ message: "Your cart is empty." });
    }
    const productsInCart = userWithCart?.dataValues.Cart.dataValues.Products;
    const productArray = productsInCart.map(
      (product: any) => product.dataValues
    );
    let grandTotal: number = 0;
    productArray.forEach((product: any) => {
      product.subTotal =
        product.selling_price * product.CartProducts.dataValues.quantity;
      grandTotal += product.subTotal;
    });
    return res.status(200).json({
      message: "Product has been added to cart.",
      cartProducts: userWithCart?.dataValues.Cart.dataValues.Products,
      cartGrandTotal: grandTotal,
    });
  } catch (error) {
    console.error("Error in finding all products function :", error);
    return res.status(400).json({ message: "Couldn't load all products." });
  }
};

export const addToCart: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUser = req.body.user;
    const { productId } = req.query;
    if (!productId) {
      console.log("No productId in query params.");
      return res
        .status(400)
        .json({ message: "Please provide a product id as query param." });
    }
    if (!loggedInUser) {
      console.log("No user found. User is not logged in.");
      return res
        .status(400)
        .json({ message: "No user found. User is not logged in." });
    }
    if (typeof productId === "string") {
      //finding the user
      const user: User | null | undefined = await dbQueries.findUserByEmail(
        loggedInUser.email
      );
      if (!user) {
        console.log("No user found. User is not logged in.");
        return res
          .status(400)
          .json({ message: "No user found. User is not logged in." });
      }
      //finding user cart
      let userCart: Cart | null | undefined = await dbQueries.findCartByUserId(
        user.id
      );
      if (!userCart) {
        //creating user cart
        userCart = await dbQueries.createCart(user.id);
        if (userCart) {
          //creating cart product
          await dbQueries.createCartProduct(
            userCart.id,
            parseInt(productId),
            1
          );
        }
        console.log("Product has been added to cart.");
        return res
          .status(200)
          .json({ message: "Created cart and added product to cart." });
      } else {
        const existingProduct: CartProducts | null | undefined =
          await dbQueries.findExistingCartProduct(
            userCart.id,
            parseInt(productId)
          );
        if (!existingProduct) {
          //creating cart product
          await dbQueries.createCartProduct(
            userCart.id,
            parseInt(productId),
            1
          );
          console.log("Product has been added to cart.");
          return res
            .status(200)
            .json({ message: "Product has been added to cart." });
        } else {
          //incrementing quantity of existing cart product
          existingProduct.quantity += 1;
          await existingProduct.save();
          console.log("Product quantity has been increased.");
          return res
            .status(200)
            .json({ message: "Product quantity has been increased." });
        }
      }
    }
  } catch (error) {
    console.error("Error in user add to cart function :", error);
    return res.status(400).json({ message: "Couldn't add to cart." });
  }
};

export const decreaseCartQuantity: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUser = req.body.user;
    if (!loggedInUser) {
      console.log("No user found. User is not logged in.");
      return res
        .status(400)
        .json({ message: "No user found. User is not logged in." });
    }
    const { productId } = req.query;
    if (!productId) {
      console.log("No productId in query params.");
      return res
        .status(400)
        .json({ message: "Please provide a product id as query param." });
    }
    if (typeof productId === "string") {
      //finding the user
      const user: User | null | undefined = await dbQueries.findUserByEmail(
        loggedInUser.email
      );
      if (!user) {
        console.log("No user found. User is not logged in.");
        return res
          .status(400)
          .json({ message: "No user found. User is not logged in." });
      }
      //finding user cart
      let userCart: Cart | null | undefined = await dbQueries.findCartByUserId(
        user.id
      );
      if (!userCart) {
        console.log("No cart found.");
        return res.status(400).json({ message: "No cart found." });
      } else {
        const existingProduct: CartProducts | null | undefined =
          await dbQueries.findExistingCartProduct(
            userCart.id,
            parseInt(productId)
          );
        if (!existingProduct) {
          console.log("This product is not in the cart.");
          return res
            .status(400)
            .json({ message: "This product is not in the cart." });
        } else if (existingProduct.quantity > 1) {
          existingProduct.quantity -= 1;
          await existingProduct.save();
          console.log("Product quantity has been reduced.");
          return res
            .status(200)
            .json({ message: "Product has been added to cart." });
        } else if (existingProduct.quantity === 1) {
          await dbQueries.destroyCartProduct(userCart.id, parseInt(productId));
          console.log("Product has been removed.");
          return res.status(200).json({ message: "Product has been removed." });
        }
      }
    }
  } catch (error) {
    console.error("Error in user decreaseCartQuantity function :", error);
    return res
      .status(400)
      .json({ message: "Couldn't decrease cart quantity." });
  }
};

export const increaseCartQuantity: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUser = req.body.user;
    if (!loggedInUser) {
      console.log("No user found. User is not logged in.");
      return res
        .status(400)
        .json({ message: "No user found. User is not logged in." });
    }
    const { productId } = req.query;
    if (!productId) {
      console.log("No productId in query params.");
      return res
        .status(400)
        .json({ message: "Please provide a product id as query param." });
    }
    if (typeof productId === "string") {
      //finding the user
      const user: User | null | undefined = await dbQueries.findUserByEmail(
        loggedInUser.email
      );
      if (!user) {
        console.log("No user found. User is not logged in.");
        return res
          .status(400)
          .json({ message: "No user found. User is not logged in." });
      }

      //finding user cart
      let userCart: Cart | null | undefined = await dbQueries.findCartByUserId(
        user.id
      );
      if (!userCart) {
        console.log("No cart found.");
        return res.status(400).json({ message: "No cart found." });
      } else {
        const existingProduct: CartProducts | null | undefined =
          await dbQueries.findExistingCartProduct(
            userCart.id,
            parseInt(productId)
          );
        if (!existingProduct) {
          console.log("This product is not in the cart.");
          return res
            .status(400)
            .json({ message: "This product is not in the cart." });
        } else if (existingProduct) {
          existingProduct.quantity += 1;
          await existingProduct.save();
          console.log("Product quantity has been increased.");
          return res
            .status(200)
            .json({ message: "Product quantity has been increased." });
        }
      }
    }
  } catch (error) {
    console.error("Error in user increaseCartQuantity function :", error);
    return res.status(400).json({ message: "Couldn't increaseCartQuantity." });
  }
};

export const removeCartItem: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUser = req.body.user;
    if (!loggedInUser) {
      console.log("No user found. User is not logged in.");
      return res
        .status(400)
        .json({ message: "No user found. User is not logged in." });
    }
    const { productId } = req.query;
    if (!productId) {
      console.log("No productId in query params.");
      return res
        .status(400)
        .json({ message: "Please provide a product id as query param." });
    }
    if (typeof productId === "string") {
      //finding the user
      const user: User | null | undefined = await dbQueries.findUserByEmail(
        loggedInUser.email
      );
      if (!user) {
        console.log("No user found. User is not logged in.");
        return res
          .status(400)
          .json({ message: "No user found. User is not logged in." });
      }

      //finding user cart
      let userCart: Cart | null | undefined = await dbQueries.findCartByUserId(
        user.id
      );
      if (!userCart) {
        console.log("No cart found.");
        return res.status(400).json({ message: "No cart found." });
      } else {
        const existingProduct: CartProducts | null | undefined =
          await dbQueries.findExistingCartProduct(
            userCart.id,
            parseInt(productId)
          );
        if (!existingProduct) {
          console.log("This product is not in the cart.");
          return res
            .status(400)
            .json({ message: "This product is not in the cart." });
        } else if (existingProduct) {
          await dbQueries.destroyCartProduct(userCart.id, parseInt(productId));
          console.log("Product has been removed.");
          return res.status(200).json({ message: "Product has been removed." });
        }
      }
    }
  } catch (error) {
    console.error("Error in user remove cart item function :", error);
    return res.status(400).json({ message: "Couldn't remove cart item." });
  }
};
