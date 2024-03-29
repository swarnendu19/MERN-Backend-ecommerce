import { myCache } from "../app.js";
import { Product } from "../models/produc.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NewUserRequestBody } from "../types/types.js";
import { Request } from "express";
import {rm } from "fs"
import { invalidateCache } from "../utils/features.js";


export const getlatestProducts = asyncHandler(async (req, res, next) => {
    let products;
  
    if (myCache.has("latest-products"))
      products = JSON.parse(myCache.get("latest-products") as string);
    else {
      products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
      myCache.set("latest-products", JSON.stringify(products));
    }
  
    return res.status(200).json({
      success: true,
      products,
    });
  });

  export const getAllCategories = asyncHandler(async (req, res, next) => {
    let categories;
  
    if (myCache.has("categories"))
      categories = JSON.parse(myCache.get("categories") as string);
    else {
      categories = await Product.distinct("category");
      myCache.set("categories", JSON.stringify(categories));
    }
  
    return res.status(200).json({
      success: true,
      categories,
    });
  });

  export const getAdminProducts = asyncHandler(async (req, res, next) => {
    let products;
    if (myCache.has("all-products"))
      products = JSON.parse(myCache.get("all-products") as string);
    else {
      products = await Product.find({});
      myCache.set("all-products", JSON.stringify(products));
    }
  
    return res.status(200).json({
      success: true,
      products,
    });
  });

  export const getSingleProduct = asyncHandler(async (req, res, next) => {
    let product;
    const id = req.params.id;
    if (myCache.has(`product-${id}`))
      product = JSON.parse(myCache.get(`product-${id}`) as string);
    else {
      product = await Product.findById(id);
  
      if (!product) return next(new ApiError(404,"Product Not Found"));
  
      myCache.set(`product-${id}`, JSON.stringify(product));
    }
  
    return res.status(200).json({
      success: true,
      product,
    });
  });

  export const newProduct = asyncHandler(
    async(req: Request<{}, {}, NewUserRequestBody>, res, next)=>{
        const { name, price, stock, category } = req.body;
        const photo = req.file;

        if(!photo) throw new ApiError(400, "Please add photo")
        
        if(!photo || !price || !stock || !category){
            rm(photo.path, ()=>{
                console.log("Deleted");
                
            })
            throw new ApiError(400, "Abe Sare Fields Dal ", 400)
        }

        await Product.create({
            name, 
            price,
            stock,
            category: category.toLowerCase(),
            photo: photo.path,
        })

        invalidateCache({product: true, admin: true})
        
        return res.status(201).json({
            success: true,
            message: "Product Created Successfully"
        })

    }
  )