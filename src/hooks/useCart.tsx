import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO

      const stock = (await api.get(`/stock/${productId}`)).data;

      const newCart = [...cart];

      const productExists = newCart.find(
        (product: Product) => product.id === productId
      );

      const stockAmount = stock.amount;
      const currentAmount = productExists ? productExists.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }
      //SE EXISTE
      if (productExists) {
        productExists.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`);
        const newProduct = {
          ...product.data,
          amount: 1,
        };
        newCart.push(newProduct);
      }

      setCart(newCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));

      // if (indexProduto !== -1) {
      //   if (stock[productId - 1].amount >= cart[indexProduto].amount + 1) {
      //     cart[indexProduto].amount++;
      //     updateProductAmount({ productId: cart[indexProduto].id, amount: 1 });
      //     const newCart = [...cart];
      //     setCart(newCart);
      //     localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      //   } else {
      //     return;
      //   }
      // }
      // //SE NÃO EXISTE
      // else {
      //   const product = products.find(
      //     (produto: Product) => produto.id === productId
      //   );

      //   const newCart: Product[] = [...cart, { ...product, amount: 1 }];
      //   setCart(newCart);
      //   localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      // }
    } catch (error) {
      // TODO
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const indexProduto = cart.findIndex(
        (product: Product) => product.id === productId
      );
      if (indexProduto !== -1) {
        cart.splice(indexProduto, 1);
        setCart([...cart]);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify([...cart]));
      } else {
        throw Error();
      }
    } catch {
      // TODO
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <= 0) return;
      const stock = (await api.get(`/stock/${productId}`)).data;
      const stockAmount = stock.amount;

      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const newCart = [...cart];
      const productExists = newCart.find((cartProduct) => {
        return cartProduct.id === productId;
      });

      if (productExists) {
        productExists.amount = amount;
        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      } else {
        throw Error();
      }
    } catch {
      // TODO
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
