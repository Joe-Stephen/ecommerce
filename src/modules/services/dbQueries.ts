import { Op } from "sequelize";
import sequelize from "../config/db";

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
import Cancel from "../order/cancelOrderModel";

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

  //find products for the provided ids (as array)
  async findAllProductsInArray(ids: number[]) {
    try {
      const products = await Product.findAll({
        where: { ids },
      });
      return products;
    } catch (error) {
      console.error("Error in findProductsInArray :", error);
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

  //create new order
  async createOrder(userId: number, totalAmount: number) {
    try {
      const newOrder: Order | null = await Order.create({
        userId,
        totalAmount,
      });
      return newOrder;
    } catch (error) {
      console.error("Error in createOrder :", error);
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

  //find all notifications by user id
  async findAllNotificationsByUserId(userId: number) {
    try {
      const notifications: Notification[] | [] = await Notification.findAll({
        where: { userId },
      });
      return notifications;
    } catch (error) {
      console.error("Error in findAllNotificationsByUserId :", error);
    }
  }

  //toggle status by provided array of ids
  async toggleStatusByIdArray(ids: number[]) {
    try {
      await Notification.update(
        { checked: sequelize.literal("NOT checked") },
        { where: { ids } }
      );
      return true;
    } catch (error) {
      console.error("Error in findAllNotificationsByIdArray :", error);
      return false;
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

  //-----CART TABLE QUERIES-----//

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

  //destroy a cart by user id
  async destroyCart(userId: number) {
    try {
      await Cart.destroy({ where: { userId } });
      return true;
    } catch (error) {
      console.error("Error in createCart :", error);
      return false;
    }
  }

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
      return true;
    } catch (error) {
      console.error("Error in destroyCartProduct :", error);
      return false;
    }
  }

  //destroy all cart products in a cart by cart id
  async destroyAllCartProducts(cartId: number) {
    try {
      await CartProducts.destroy({ where: { cartId } });
      return true;
    } catch (error) {
      console.error("Error in destroyAllCartProducts :", error);
      return false;
    }
  }

  //-----ORDERPRODUCTS TABLE QUERIES-----//

  //create order product
  async createOrderProduct(
    orderId: number,
    productId: number,
    price: number,
    quantity: number
  ) {
    try {
      await OrderProducts.create({ orderId, productId, price, quantity });
      return true;
    } catch (error) {
      console.error("Error in createOrderProduct :", error);
      return false;
    }
  }

  //update quantity of order product by id
  async updateOrderProductQty(quantity: number, id: number) {
    try {
      await OrderProducts.update({ quantity }, { where: { id } });
      return true;
    } catch (error) {
      console.error("Error in updateOrderProductQty :", error);
      return false;
    }
  }

  //destroy an order product by id
  async destroyOrdertProduct(id: number) {
    try {
      await OrderProducts.destroy({ where: { id } });
      return true;
    } catch (error) {
      console.error("Error in destroyOrdertProduct :", error);
      return false;
    }
  }

  //find a order product by product id and order id
  async findOrderProductByProductAndOrderIds(
    productId: number,
    orderId: number
  ) {
    try {
      const orderProduct: OrderProducts | null = await OrderProducts.findOne({
        where: { productId, orderId },
      });
      return orderProduct;
    } catch (error) {
      console.error("Error in findOrderProductByProductAndOrderIds :", error);
    }
  }

  //find all order products of an order
  async findAllOrderProducts(orderId: number) {
    try {
      const orderProducts: OrderProducts[] | [] = await OrderProducts.findAll({
        where: { orderId },
      });
      return orderProducts;
    } catch (error) {
      console.error("Error in createOrderProduct :", error);
    }
  }

  //-----CANCEL TABLE QUERIES-----//

  //create a cancel request
  async createCancelRequest(orderId: number, reason: string) {
    try {
      await Cancel.create({ orderId, reason });
      return true;
    } catch (error) {
      console.error("Error in createOrderProduct :", error);
      return false;
    }
  }
}
