FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port the app runs on (Hugging Face routes to 7860 by default)
ENV PORT=7860
EXPOSE 7860

# Run the application using Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]
