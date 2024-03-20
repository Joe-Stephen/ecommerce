import { Op } from "sequelize";

//importing models
import User from "../user/userModel";
import Product from "../product/productModel";
import Cart from "../cart/cartModel";
import Image from "../product/imageModel";
import Order from "../order/orderModel";
import OrderProducts from "../order/orderProductsModel";
import Notification from "../notifications/notificationModel";
import Verifications from "../user/verificationsModel";
import CartProducts from "../cart/cartProductsModel";

export default class DBQueries {
  //-----USER TABLE QUERIES-----//

  //create new user
  async createUser(username: string, email: string, hashedPassword: string) {
    try {
      const user: User | null = await User.create({
        username,
        email,
        password: hashedPassword,
      });
      return user;
    } catch (error) {
      console.error("Error in findUserByEmail :", error);
    }
  }

  //update a user by id
  async updateUserById(
    id: number,
    username: string,
    email: string,
    password: string
  ) {
    try {
      await User.update({ username, email, password }, { where: { id } });
      return true;
    } catch (error) {
      console.error("Error in updateUserById :", error);
      return false;
    }
  }

  //find all users
  async findAllUsers() {
    try {
      const users: User[] | [] = await User.findAll();
      return users;
    } catch (error) {
      console.error("Error in findUserByEmail :", error);
    }
  }

  //find a user by email
  async findUserByEmail(email: string) {
    try {
      const user: User | null = await User.findOne({ where: { email } });
      return user;
    } catch (error) {
      console.error("Error in findUserByEmail :", error);
    }
  }

  //find a user with cart by email
  async findUserWithCartByEmail(email: string) {
    try {
      const userWithCart: User | null = await User.findOne({
        where: { email },
        include: [
          {
            model: Cart,
            include: [Product],
          },
        ],
      });
      return userWithCart;
    } catch (error) {
      console.error("Error in findUserWithCartByEmail :", error);
    }
  }

  //find a user by id
  async findUserById(userId: number) {
    try {
      const user: User | null = await User.findByPk(userId, {});
      return user;
    } catch (error) {
      console.error("Error in findUserById :", error);
    }
  }

  //delete a user by id
  async deleteUserById(id: number) {
    try {
      await User.destroy({ where: { id } });
      return true;
    } catch (error) {
      console.error("Error in deleteUserByPk :", error);
      return false;
    }
  }

  //find a user by email and not equal to provided id
  async checkForDuplicateUser(email: string, id: number) {
    try {
      const existingUser: User | null = await User.findOne({
        where: { email: email, id: { [Op.ne]: id } },
      });
      return existingUser;
    } catch (error) {
      console.error("Error in checkForDuplicateUser :", error);
    }
  }

  //-----PRODUCT TABLE QUERIES-----//

  //find a product by name and not equal to provided id
  async checkForDuplicateProduct(name: string, productId: number) {
    try {
      const existingProduct: Product | null = await Product.findOne({
        where: { name: name, id: { [Op.ne]: productId } },
      });
      return existingProduct;
    } catch (error) {
      console.error("Error in checkForDuplicateProduct :", error);
    }
  }
  //find a product by name
  async findProductByName(name: string) {
    try {
      const product: Product | null = await Product.findOne({
        where: { name: name },
      });
      return product;
    } catch (error) {
      console.error("Error in findProductByName :", error);
    }
  }
  //find all products with considering provided filter
  async findAllProductsWithFilter(
    count: number,
    skip: number,
    whereCondition: {},
    orderCondition: []
  ) {
    try {
      const products: Product[] | [] = await Product.findAll({
        limit: count,
        offset: skip,
        where: whereCondition,
        order: orderCondition,
        include: [{ model: Image, attributes: ["image"] }],
      });
      return products;
    } catch (error) {
      console.error("Error in findAllProducts :", error);
    }
  }
  //create a new product
  async createProduct(formData: {}) {
    try {
      const newProduct: Product | null = await Product.create(formData);
      return newProduct;
    } catch (error) {
      console.error("Error in createProduct :", error);
    }
  }
  //update a product
  async updateProduct(formData: {}, productId: number) {
    try {
      const updatedProduct = await Product.update(formData, {
        where: { id: productId },
      });
      return updatedProduct;
    } catch (error) {
      console.error("Error in createProduct :", error);
    }
  }

  //-----IMAGE TABLE QUERIES-----//

  //clear existing images of a product
  async clearExistingImages(productId: number) {
    try {
      await Image.destroy({ where: { productId: productId } });
      return true;
    } catch (error) {
      console.error("Error in clearExistingImages :", error);
      return false;
    }
  }
  //save images of a product
  async saveProductImages(productId: number, file: any) {
    try {
      await Image.create({
        productId: productId,
        image: file.originalname,
      });
      return true;
    } catch (error) {
      console.error("Error in saveProductImages :", error);
      return false;
    }
  }

  //-----ORDER TABLE QUERIES-----//

  //find all orders with provided query-options
  async findAllOrdersWithOptions(queryOptions: {}) {
    try {
      const orders: Order[] | [] = await Order.findAll(queryOptions);
      return orders;
    } catch (error) {
      console.error("Error in findAllOrdersWithOptions :", error);
    }
  }

  //find an order using id
  async findOrderById(orderId: number) {
    try {
      const order: Order | null = await Order.findByPk(orderId, {
        include: [
          {
            model: OrderProducts,
            as: "orderProducts",
            include: [Product],
          },
        ],
      });
      return order;
    } catch (error) {
      console.error("Error in findOrderWithId :", error);
    }
  }

  //-----NOTIFICATION TABLE QUERIES-----//

  //create notifications for the provided ids (as array)
  async createNotificationInBulk(
    userId: number,
    label: string,
    content: string
  ) {
    try {
      const notifications = await Notification.create({
        userId,
        label,
        content,
      });
      return notifications;
    } catch (error) {
      console.error("Error in createNotification :", error);
    }
  }

  //create notifications for all the users
  async createNotificationForAll(label: string, content: string) {
    try {
      const notifications = await Notification.create({
        label,
        content,
      });
      return notifications;
    } catch (error) {
      console.error("Error in createNotificationForAll :", error);
    }
  }

  //create notifications for a single user
  async createNotificationForOne(
    userId: number,
    label: string,
    content: string
  ) {
    try {
      const notification = await Notification.create({
        userId,
        label,
        content,
      });
      return notification;
    } catch (error) {
      console.error("Error in createNotificationForAll :", error);
    }
  }

  //-----VERIFICATIONS TABLE QUERIES-----//

  //creating an verification entry (for otp)
  async createVerification(email: string, otp: string) {
    try {
      const verification = await Verifications.create({
        email,
        otp,
      });
      return verification;
    } catch (error) {
      console.error("Error in createVerification :", error);
    }
  }

  //finding a verification by email
  async findVerificationByEmail(email: string) {
    try {
      const verification = await Verifications.findOne({ where: { email } });
      return verification;
    } catch (error) {
      console.error("Error in findVerificationByEmail :", error);
    }
  }

  //destroying a verification by email
  async destroyVerificationByEmail(email: string) {
    try {
      await Verifications.destroy({ where: { email } });
      return true;
    } catch (error) {
      console.error("Error in findVerificationByEmail :", error);
      return false;
    }
  }

  //-----NOTIFICATION TABLE QUERIES-----//

  //create a cart
  async createCart(userId: number) {
    try {
      const cart: Cart | null = await Cart.create({
        userId,
      });
      return cart;
    } catch (error) {
      console.error("Error in createCart :", error);
    }
  }

  //find a cart by user id
  async findCartByUserId(userId: number) {
    try {
      const cart: Cart | null = await Cart.findOne({ where: { userId } });
      return cart;
    } catch (error) {
      console.error("Error in createCart :", error);
    }
  }

  //decrease quantity of product in cart

  //-----CARTPRODUCTS TABLE QUERIES-----//

  //create cart product
  async createCartProduct(cartId: number, productId: number, quantity: number) {
    try {
      await CartProducts.create({ cartId, productId, quantity });
      return true;
    } catch (error) {
      console.error("Error in createOrderProduct :", error);
      return false;
    }
  }

  //find a product in cart products by cart id and product id
  async findExistingCartProduct(cartId: number, productId: number) {
    try {
      const cartProduct: CartProducts | null = await CartProducts.findOne({
        where: { cartId, productId },
      });
      return cartProduct;
    } catch (error) {
      console.error("Error in findExistingCartProduct :", error);
    }
  }

  //destroy a cart product by cart id and product id
  async destroyCartProduct(cartId: number, productId: number) {
    try {
      await CartProducts.destroy({ where: { cartId, productId } });
    } catch (error) {}
  }
}
