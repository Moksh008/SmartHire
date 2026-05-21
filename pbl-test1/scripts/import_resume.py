#!/usr/bin/env python3
"""
Import a PDF resume into the backend storage and create or update a Resume DB row.

Usage:
  python import_resume.py --file /path/to/resume.pdf --job-id 1 --email candidate@example.com
  python import_resume.py --file /path/to/resume.pdf --resume-id 42

If --resume-id is provided the script updates that resume's file_path/file_name. If --job-id is provided the script will create a new resume linked to that job.
"""
import argparse
import shutil
import time
from pathlib import Path

from database import SessionLocal, create_resume, get_resume_by_id
from database import JobDescription


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--file", required=True, help="Path to PDF file to import")
    p.add_argument("--job-id", type=int, help="Job (JD) id to attach resume to when creating new resume")
    p.add_argument("--email", help="Candidate email to use when creating new resume")
    p.add_argument("--resume-id", type=int, help="If provided, update existing resume row instead of creating a new one")
    args = p.parse_args()

    src = Path(args.file)
    if not src.exists():
        print("File not found:", src)
        return

    dest_dir = Path(__file__).resolve().parents[1] / "data" / "resumes"
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_name = f"{int(time.time())}_{src.name}"
    dest_path = dest_dir / dest_name

    shutil.copy2(src, dest_path)
    print("Copied file to:", dest_path)

    # If resume-id provided, update that row
    if args.resume_id:
        db = SessionLocal()
        try:
            r = db.query(get_resume_by_id.__annotations__.get('return', None)).first() if False else None
        finally:
            db.close()
        # simplest: use get_resume_by_id helper
        r = get_resume_by_id(args.resume_id)
        if not r:
            print("Resume id not found:", args.resume_id)
            return
        # update file_path and file_name
        db = SessionLocal()
        try:
            rr = db.query(type(r)).filter(type(r).id == args.resume_id).first()
            rr.file_path = str(dest_path)
            rr.file_name = src.name
            db.commit()
            print("Updated resume id", args.resume_id)
        finally:
            db.close()
        return

    # Otherwise create a new resume
    if not args.job_id:
        print("--job-id is required when creating a new resume")
        return
    if not args.email:
        print("--email is required when creating a new resume")
        return

    # verify job exists
    db = SessionLocal()
    try:
        job = db.query(JobDescription).filter(JobDescription.id == args.job_id).first()
    finally:
        db.close()
    if not job:
        print("Job id not found:", args.job_id)
        return

    # minimal analysis_data placeholder; server will set ats_score to 0.0 if missing
    analysis_data = {}
    resume = create_resume(candidate_email=args.email, file_path=str(dest_path), file_name=src.name, jd_id=args.job_id, analysis_data=analysis_data)
    print("Created resume id:", resume.id)


if __name__ == '__main__':
    main()
