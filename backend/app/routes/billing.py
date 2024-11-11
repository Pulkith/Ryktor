from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import List
import os
import tempfile
from ..services.computer_vision import insurance_card_pipeline, medical_bill_pipeline, pdf_doc_pipeline
from ..database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import datetime
from pathlib import Path
import uuid

router = APIRouter()

@router.post("/insurance/upload")
async def upload_insurance_card(
    front_image: UploadFile = File(...),
    back_image: UploadFile = File(...),
    user_id: str = Form(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
        
    # Get user information
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        full_name = f"{user['first_name']} {user['last_name']}"
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    # Create temporary files for the uploaded images
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as front_temp:
        front_temp.write(await front_image.read())
        front_path = front_temp.name
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as back_temp:
        back_temp.write(await back_image.read())
        back_path = back_temp.name

    try:
        # Process the insurance card images
        result_text = insurance_card_pipeline(front_path, back_path, full_name)
        # Store the processed insurance card in the database
        db.users.update_one({
            "_id": ObjectId(user_id)
        }, {
            "$set": {
                "insurance_card": result_text
            }
        })
    finally:
        # Clean up temporary files
        os.unlink(front_path)
        os.unlink(back_path) 

@router.post("/receipt/upload")
async def upload_medical_receipt(
    receipt: UploadFile = File(...),
    illness_id: str = Form(...),
    user_id: str = Form(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    if not illness_id:
        raise HTTPException(status_code=400, detail="Illness ID is required")
        
    # Get user information
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        

    # move the uploaded file to a permanent location

    username = str(ObjectId(user_id))

    parent = str(Path(__file__).parent.parent.parent.parent)
    dictory_store = parent + f"/frontend/public/uploaded_files/{username}/"
    # dictory_store = f"../../frontend/public/uploaded_files/{username}/"

    # create the directory if it does not exist
    if not os.path.exists(dictory_store):
        os.makedirs(dictory_store)

    # change receipt.filename to a unique name with 8 random characters
    # move file extension to the end of the filename
    receipt.filename = f"{str(uuid.uuid4())[:16]}{Path(receipt.filename).suffix}"

    # move file to the directory
    with open(f"{dictory_store}{receipt.filename}", "wb") as f:
        f.write(receipt.file.read())
    
    full_path = f"{dictory_store}{receipt.filename}"


    # Create temporary file for the uploaded image
    # with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
        # temp_file.write(await receipt.read())
        # file_path = temp_file.name

    try:
        # Process the medical receipt
        result = medical_bill_pipeline([full_path])
        result["file_name"] = receipt.filename
        
        # Store the processed receipt in the database
        receipt_entry = {
            "user_id": user_id,
            "illness_id": illness_id,
            "processed_data": result,
            "created_at": datetime.datetime.utcnow()
        }
        
        await db.medical_receipts.insert_one(receipt_entry)
        return result
        
    finally:
        pass
        # Clean up temporary file
        # os.unlink(file_path) 

@router.post('/record/upload')
async def upload_medical_record(
    record: UploadFile = File(...),
    user_id: str = Form(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
        
    # Get user information
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        

    # move the uploaded file to a permanent location

    username = str(ObjectId(user_id))

    parent = str(Path(__file__).parent.parent.parent.parent)
    dictory_store = parent + f"/frontend/public/uploaded_files/{username}/"
    # dictory_store = f"../../frontend/public/uploaded_files/{username}/"

    # create the directory if it does not exist
    if not os.path.exists(dictory_store):
        os.makedirs(dictory_store)

    # change receipt.filename to a unique name with 8 random characters
    # move file extension to the end of the filename
    record.filename = f"{str(uuid.uuid4())[:16]}{Path(record.filename).suffix}"

    # move file to the directory
    with open(f"{dictory_store}{record.filename}", "wb") as f:
        f.write(record.file.read())
    
    full_path = f"{dictory_store}{record.filename}"

    # Create temporary file for the uploaded image
    # with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
        # temp_file.write(await record.read())
        # file_path = temp_file.name

    try:
        result_text = pdf_doc_pipeline(full_path)

        # Store the processed receipt in the database
        record_entry = {
            "user_id": user_id,
            "file_name": record.filename,
            "created_at": datetime.datetime.utcnow(),
            "text": result_text
        }

        record_entry["user_id"] = str(record_entry["user_id"])
        
        await db.medical_records.insert_one(record_entry)
        # return record_entry
        
    finally:
        pass
        # Clean up temporary file
        # os.unlink(file_path)


@router.get("/receipt/user/{user_id}")
async def get_all_receipts(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
        
    # Verify user exists
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Fetch receipts
    receipts_cursor = db.medical_receipts.find({"user_id": user_id})
    receipts = await receipts_cursor.to_list(length=None)  # Convert cursor to list

    # Convert ObjectId fields to strings for JSON serialization
    for receipt in receipts:
        receipt["_id"] = str(receipt["_id"])
        receipt["user_id"] = str(receipt["user_id"])

    return receipts


@router.get("/record/user/{user_id}")
async def get_all_records(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
        
    # Verify user exists
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Fetch receipts
    receipts_cursor = db.medical_records.find({"user_id": user_id})
    receipts = await receipts_cursor.to_list(length=None)  # Convert cursor to list

    # Convert ObjectId fields to strings for JSON serialization
    for receipt in receipts:
        receipt["_id"] = str(receipt["_id"])
        receipt["user_id"] = str(receipt["user_id"])

    return receipts


@router.get("/receipt/bill/{receipt_id}")
async def get_receipt(
    receipt_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not receipt_id:
        raise HTTPException(status_code=400, detail="Receipt ID is required")
        
    # Fetch receipt
    try:
        receipt = await db.medical_receipts.find_one({"_id": ObjectId(receipt_id)})
        if not receipt:
            raise HTTPException(status_code=404, detail="Receipt not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid receipt ID")

    # Convert ObjectId fields to strings for JSON serialization
    receipt["_id"] = str(receipt["_id"])
    receipt["user_id"] = str(receipt["user_id"])

    return receipt

@router.delete("/receipt/{receipt_id}")
async def delete_receipt(
    receipt_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not receipt_id:
        raise HTTPException(status_code=400, detail="Receipt ID is required")
        
    try:
        result = await db.medical_receipts.delete_one({"_id": ObjectId(receipt_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Receipt not found")
        return {"message": "Receipt deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/insurance/{user_id}")
async def get_insurance_card(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
        
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user or not user.get('insurance_card'):
            raise HTTPException(status_code=404, detail="Insurance card not found")
        return user['insurance_card']
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))