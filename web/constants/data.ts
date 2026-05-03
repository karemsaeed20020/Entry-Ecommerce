import { footerFour, footerOne, footerThree, footerTwo } from "@/assets/image";

const topHelpCenter = [
  { title: "Help Center", href: "/help" },
  { title: "Wishlist", href: "/user/wishlist" },
  { title: "Order Tracking", href: "/user/orders" },
  { title: "Shop Now", href: "/shop" },
];

export const bottomHeaderNavList = [
  { title: "Home", key: "home", href: "/" },
  { title: "Shop", key: "shop", href: "/shop" },
  { title: "Features", key: "features", href: "/features" },
  { title: "New Arrivals", key: "newArrivals", href: "/new-arrivals" },
  { title: "Blogs", key: "blogs", href: "/blogs" },
  { title: "About Us", key: "aboutUs", href: "/about" },
  { title: "Contact Us", key: "contactUs", href: "/contact" },
];

const footerTopData = [
  {
    title: "Free Shipping",
    subTitle: "Free Shipping for orders over $99",
    image: footerOne,
  },
  {
    title: "Money Guarantee",
    subTitle: "Within 30 days for an exchange",
    image: footerTwo,
  },
  {
    title: "Online Support",
    subTitle: "24 hours a day, 7 days a week",
    image: footerThree,
  },
  {
    title: "Flexible Payment",
    subTitle: "Pay with Multiple Credit Cards",
    image: footerFour,
  },
];

export { topHelpCenter, footerTopData };
