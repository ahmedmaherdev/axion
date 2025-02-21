const emojis = require("../../public/emojis.data.json");

module.exports = {
  id: {
    path: "id",
    type: "string",
    length: { min: 1, max: 50 },
  },
  username: {
    path: "username",
    type: "string",
    length: { min: 3, max: 20 },
    custom: "username",
  },
  password: {
    path: "password",
    type: "string",
    length: { min: 8, max: 100 },
  },
  passwordConfirm: {
    path: "password",
    type: "string",
    length: { min: 8, max: 100 },
  },

  newPassword: {
    path: "password",
    type: "string",
    length: { min: 8, max: 100 },
  },
  newPasswordConfirm: {
    path: "password",
    type: "string",
    length: { min: 8, max: 100 },
  },
  // email: {
  //   path: "email",
  //   type: "string",
  //   length: { min: 3, max: 100 },
  // },
  title: {
    path: "title",
    type: "string",
    length: { min: 3, max: 300 },
  },
  label: {
    path: "label",
    type: "string",
    length: { min: 3, max: 100 },
  },
  shortDesc: {
    path: "desc",
    type: "string",
    length: { min: 3, max: 300 },
  },
  longDesc: {
    path: "desc",
    type: "string",
    length: { min: 3, max: 2000 },
  },
  url: {
    path: "url",
    type: "string",
    length: { min: 9, max: 300 },
  },
  emoji: {
    path: "emoji",
    type: "Array",
    items: {
      type: "string",
      length: { min: 1, max: 10 },
      oneOf: emojis.value,
    },
  },
  price: {
    path: "price",
    type: "number",
  },
  avatar: {
    path: "avatar",
    type: "string",
    length: { min: 8, max: 100 },
  },
  text: {
    type: "String",
    length: { min: 3, max: 15 },
  },
  longText: {
    type: "String",
    length: { min: 3, max: 250 },
  },
  paragraph: {
    type: "String",
    length: { min: 3, max: 10000 },
  },
  phone: {
    type: "String",
    length: 13,
  },
  email: {
    path: "email",
    //   type: "string",
    length: { min: 3, max: 100 },
    type: "String",
    regex:
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  },
  number: {
    type: "Number",
    length: { min: 1, max: 6 },
  },
  arrayOfStrings: {
    type: "Array",
    items: {
      type: "String",
      length: { min: 3, max: 100 },
    },
  },
  obj: {
    type: "Object",
  },
  bool: {
    type: "Boolean",
  },
  name: {
    path: "name",
    type: "string",
    length: { min: 3, max: 300 },
  },
  school: {
    path: "school",
    type: "string",
    length: { min: 3, max: 300 },
  },
  classroom: {
    path: "classroom",
    type: "string",
    length: { min: 3, max: 300 },
  },
  student: {
    path: "student",
    type: "string",
    length: { min: 3, max: 300 },
  },
  role: {
    path: "role",
    type: "string",
    length: { min: 3, max: 10 },
  },
  location: {
    path: "location",
    type: "string",
    length: { min: 3, max: 20 },
  },
};
