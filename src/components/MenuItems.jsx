
import { useState } from "react";
import { FiEyeOff } from "react-icons/fi";
import { BsCartPlus, BsEye } from "react-icons/bs";
import { BiTrash } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

const MenuItems = ({ items = [], onItemDeleted, isSeller }) => {
  const [loadingItemId, setLoadingItemId] = useState(null);

  const { fetchCart } = useAppData();

  // =========================
  // DELETE ITEM
  // =========================
  const handleDelete = async (itemId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${restaurantService}/api/item/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Item deleted");

      // Refresh menu items
      if (onItemDeleted) {
        onItemDeleted();
      }
    } catch (error) {
      console.error("DELETE ITEM ERROR:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete item"
      );
    }
  };

  // =========================
  // TOGGLE AVAILABILITY
  // =========================
  const toggleAvailability = async (itemId) => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data?.message || "Status updated");

      // Refresh menu items
      if (onItemDeleted) {
        onItemDeleted();
      }
    } catch (error) {
      console.error("TOGGLE STATUS ERROR:", error);

      toast.error(
        error?.response?.data?.message || "Failed to update status"
      );
    }
  };

  // =========================
  // ADD TO CART
  // =========================
  const addToCart = async (restaurantId, itemId) => {
    try {
      setLoadingItemId(itemId);

      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        {
          restaurantId,
          itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data?.message || "Item added to cart");

      if (fetchCart) {
        await fetchCart();
      }
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to add item to cart"
      );
    } finally {
      setLoadingItemId(null);
    }
  };

  // =========================
  // NO ITEMS
  // =========================
  if (!items || items.length === 0) {
    return (
      <div className="flex min-h-50 items-center justify-center">
        <p className="text-gray-500">
          No menu items found.
        </p>
      </div>
    );
  }

  // =========================
  // MENU ITEMS
  // =========================
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        /*
         * Your backend may return either:
         * _id
         * or
         * id
         *
         * So handle both.
         */
        const itemId = item?._id || item?.id;

        const restaurantId =
          item?.restaurantId?._id ||
          item?.restaurantId?.id ||
          item?.restaurantId;

        const isLoading = loadingItemId === itemId;

        return (
          <div
  key={itemId}
  className={`relative flex gap-4 rounded-lg bg-white p-4 shadow-sm transition ${
    !item?.available ? "opacity-70" : ""
  }`}
>
  <div className="relative shrink-0">
    <img
      src={item?.image}
      alt={item?.name || "Menu item"}
      className={`h-20 w-20 rounded object-cover ${
        !item?.available ? "grayscale brightness-75" : ""
      }`}
    />

    {!item?.available && (
      <span className="absolute inset-0 flex items-center justify-center rounded bg-black/60 text-xs font-semibold text-white">
        Not Available
      </span>
    )}
  </div>

  <div className="flex flex-1 flex-col justify-between">
    <div>
      <h3 className="font-semibold">
        {item?.name}
      </h3>

      {item?.description && (
        <p className="line-clamp-2 text-sm text-gray-500">
          {item.description}
        </p>
      )}
    </div>

    <div className="flex items-center justify-between">
      <p className="font-medium">
        ₹{item?.price}
      </p>

      {isSeller ? (
        <div className="flex gap-2">

          <button
            type="button"
            onClick={() => toggleAvailability(itemId)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            {item?.available ? (
              <BsEye size={18} />
            ) : (
              <FiEyeOff size={18} />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleDelete(itemId)}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
          >
            <BiTrash size={18} />
          </button>

        </div>
      ) : (
        <button
          type="button"
          disabled={!item?.available || isLoading}
          onClick={() => addToCart(restaurantId, itemId)}
          className={`flex items-center justify-center rounded-lg p-2 ${
            !item?.available || isLoading
              ? "cursor-not-allowed text-gray-400"
              : "text-red-500 hover:bg-red-50"
          }`}
        >
          {isLoading ? (
            <VscLoading size={18} className="animate-spin" />
          ) : (
            <BsCartPlus size={18} />
          )}
        </button>
      )}
    </div>
  </div>
</div>
        );
      }
      )}
    </div>
  );
}
export default MenuItems;

