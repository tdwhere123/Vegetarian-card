"use strict";
const common_vendor = require("../common/vendor.js");
const KEY = "cardList";
function getCardList() {
  const list = common_vendor.index.getStorageSync(KEY);
  return Array.isArray(list) ? list : [];
}
function saveCardList(list) {
  common_vendor.index.setStorageSync(KEY, list);
}
function addOrUpdateCard(card) {
  const list = getCardList();
  const i = list.findIndex((x) => x.id === card.id);
  if (i >= 0) {
    list[i] = card;
  } else {
    list.unshift(card);
  }
  saveCardList(list);
  return list;
}
exports.addOrUpdateCard = addOrUpdateCard;
exports.getCardList = getCardList;
