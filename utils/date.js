const validateBookingAndCheckoutDate = (bookingDate, checkoutDate) => {
  const checkList = { bookBeforeCheckout: true, notMoreThanThreeNights: true };
  if (bookingDate >= checkoutDate) {
    checkList.bookBeforeCheckout = false;
  } else {
    const diffTime = Math.abs(checkoutDate - bookingDate);
    const diffInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffInDays > 3) {
      checkList.notMoreThanThreeNights = false;
    }
  }
  return checkList;
};

module.exports = {
  validateBookingAndCheckoutDate,
};
