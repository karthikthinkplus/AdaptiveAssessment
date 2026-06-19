from io import BytesIO

import pandas as pd
from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.database.session import get_db
from app.exceptions import AppException, success_response
from app.services.question_upload_service import QuestionUploadService

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/question-bank")
async def upload_question_bank(
    file: UploadFile = File(...),
    current_user=Depends(require_roles(["admin", "content_manager"])),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".xlsx"):
        raise AppException("Only .xlsx files are supported", "INVALID_FILE_TYPE", 400)
    content = await file.read()
    summary = QuestionUploadService(db).upload_question_bank(content, current_user.id)
    return success_response("Question bank uploaded successfully", summary.model_dump())


@router.get("/question-bank/template")
def download_template():
    columns = QuestionUploadService.template_columns()
    dataframe = pd.DataFrame(columns=columns)
    output = BytesIO()
    dataframe.to_excel(output, index=False)
    output.seek(0)
    headers = {"Content-Disposition": 'attachment; filename="question-bank-template.xlsx"'}
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )
