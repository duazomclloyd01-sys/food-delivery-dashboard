// Central map of every dish to its photograph. All screens must read from here -
// no dish photo may be hardcoded anywhere else. Files live in assets/images/food/.
export const FOOD_IMAGES = {
  d1: {
    image: require('../../assets/images/food/adobo.jpg'),
    thumb: require('../../assets/images/food/adobo-thumb.jpg'),
    alt: 'Chicken adobo served with garlic rice',
  },
  d2: {
    image: require('../../assets/images/food/sisig.jpg'),
    thumb: require('../../assets/images/food/sisig-thumb.jpg'),
    alt: 'Crispy sisig on a sizzling plate with egg and calamansi',
  },
  d3: {
    image: require('../../assets/images/food/palabok.jpg'),
    thumb: require('../../assets/images/food/palabok-thumb.jpg'),
    alt: 'Pancit palabok with shrimp sauce, egg and chicharon',
  },
  d4: {
    image: require('../../assets/images/food/karekare.jpg'),
    thumb: require('../../assets/images/food/karekare-thumb.jpg'),
    alt: 'Beef kare-kare peanut stew with eggplant and greens',
  },
  d5: {
    image: require('../../assets/images/food/sinigang.jpg'),
    thumb: require('../../assets/images/food/sinigang-thumb.jpg'),
    alt: 'Sinigang na baboy sour tamarind soup with pork and greens',
  },
  d6: {
    image: require('../../assets/images/food/inasal.jpg'),
    thumb: require('../../assets/images/food/inasal-thumb.jpg'),
    alt: 'Chicken inasal grilled chicken with rice and calamansi',
  },
  d7: {
    image: require('../../assets/images/food/halohalo.jpg'),
    thumb: require('../../assets/images/food/halohalo-thumb.jpg'),
    alt: 'Halo-halo shaved ice dessert in a tall glass with ube',
  },
  d8: {
    image: require('../../assets/images/food/pata.jpg'),
    thumb: require('../../assets/images/food/pata-thumb.jpg'),
    alt: 'Crispy pata deep-fried pork leg with dipping sauce',
  },
  d9: {
    image: require('../../assets/images/food/buko.jpg'),
    thumb: require('../../assets/images/food/buko-thumb.jpg'),
    alt: 'Fresh buko juice served ice cold in glasses',
  },
  d10: {
    image: require('../../assets/images/food/lechon.jpg'),
    thumb: require('../../assets/images/food/lechon-thumb.jpg'),
    alt: 'Lechon kawali crispy pork belly with rice and sauce',
  },
  d11: {
    image: require('../../assets/images/food/lecheflan.jpg'),
    thumb: require('../../assets/images/food/lecheflan-thumb.jpg'),
    alt: 'Leche flan caramel custard sliced in a pan',
  },
  d12: {
    image: require('../../assets/images/food/lumpia.jpg'),
    thumb: require('../../assets/images/food/lumpia-thumb.jpg'),
    alt: 'lumpiang Shanghai fried spring rolls with sweet chili dip',
  },
  'dx-buko': {
    image: require('../../assets/images/food/bukopandan.jpg'),
    thumb: require('../../assets/images/food/bukopandan-thumb.jpg'),
    alt: 'Buko pandan green coconut dessert with jelly in a bowl',
  },
};

export const FALLBACK_IMAGE = {
  image: require('../../assets/images/food/boodle.jpg'),
  thumb: require('../../assets/images/food/boodle-thumb.jpg'),
  alt: 'Filipino boodle fight feast on banana leaves',
};

export const foodImageFor = (dishId) => FOOD_IMAGES[dishId] || FALLBACK_IMAGE;
