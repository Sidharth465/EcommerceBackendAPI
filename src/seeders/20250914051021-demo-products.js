'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, get category IDs
    const categories = await queryInterface.sequelize.query(
      `SELECT id, slug FROM categories WHERE slug IN ('mens-clothing', 'womens-clothing', 'jewelery', 'electronics')`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {});

    const products = [
      {
        id: uuidv4(),
        title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
        slug: 'fjallraven-foldsack-no-1-backpack-fits-15-laptops',
        price: 109.95,
        description:
          'Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday',
        category_id: categoryMap['mens-clothing'],
        image_url: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
        rating_rate: 3.9,
        rating_count: 120,
        stock_quantity: 50,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        title: 'Mens Casual Premium Slim Fit T-Shirts',
        slug: 'mens-casual-premium-slim-fit-t-shirts',
        price: 22.3,
        description:
          'Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing.',
        category_id: categoryMap['mens-clothing'],
        image_url: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
        rating_rate: 4.1,
        rating_count: 259,
        stock_quantity: 100,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        title: "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
        slug: 'john-hardy-womens-legends-naga-gold-silver-dragon-station-chain-bracelet',
        price: 695,
        description:
          "From our Legends Collection, the Naga was inspired by the mythical water dragon that protects the ocean's pearl.",
        category_id: categoryMap['jewelery'],
        image_url: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg',
        rating_rate: 4.6,
        rating_count: 400,
        stock_quantity: 25,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        title: 'WD 2TB Elements Portable External Hard Drive - USB 3.0',
        slug: 'wd-2tb-elements-portable-external-hard-drive-usb-3-0',
        price: 64,
        description:
          'USB 3.0 and USB 2.0 Compatibility Fast data transfers Improve PC Performance High Capacity',
        category_id: categoryMap['electronics'],
        image_url: 'https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg',
        rating_rate: 3.3,
        rating_count: 203,
        stock_quantity: 120,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        title: "BIYLACLESEN Women's 3-in-1 Snowboard Jacket Winter Coats",
        slug: 'biylaclesen-womens-3-in-1-snowboard-jacket-winter-coats',
        price: 56.99,
        description:
          'Note:The Jackets is US standard size, Please choose size as your usual wear Material: 100% Polyester; Detachable Liner Fabric: Warm Fleece.',
        category_id: categoryMap['womens-clothing'],
        image_url: 'https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg',
        rating_rate: 2.6,
        rating_count: 235,
        stock_quantity: 45,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('products', products, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
  },
};
