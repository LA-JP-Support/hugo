FROM klakegg/hugo:ubuntu AS builder
#Add a work directory
WORKDIR /app
#Copy dependencies
COPY ./check.txt ./package*.json ./package-lock.json[t] ./yarn.lock[t] ./



#Install dependencies
#Copy app files
COPY . .
#Cache and Install dependencies



#.env Source destination argument
ARG source_file=./.env
ARG destination_dir=./.env

#.env copying management
RUN if [ -f "$source_file" ]; then \
        if [ "$source_file" != "$destination_dir" ]; then \
            echo "Copying $source_file to $destination_dir"; \
            cp "$source_file" "$destination_dir"; \
        else \
            echo "Source and destination paths are the same; skipping copy."; \
        fi \
    else \
        echo ".env has been added to dockerignore; skipping copy; if you want to copy it, remove it from dockerignore."; \
    fi



#Expose port
EXPOSE 80 
#Build command

RUN hugo 
FROM nginx:alpine
# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
# Copy static assets from builder stage
COPY --from=builder /app/public .

ENTRYPOINT ["nginx", "-g", "daemon off;"]
