from app.models.student_response import StudentResponse
from app.repositories.base import Repository


class ResponseRepository(Repository[StudentResponse]):
    model = StudentResponse
