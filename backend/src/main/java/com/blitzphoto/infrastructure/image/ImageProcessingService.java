package com.blitzphoto.infrastructure.image;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

/**
 * Image Processing Service
 * 
 * Handles image processing operations including thumbnail generation,
 * image optimization, and format conversion.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ImageProcessingService {

    private final S3Client s3Client;

    @Value("${blitzphoto.aws.s3.uploads-bucket}")
    private String uploadsBucket;

    @Value("${blitzphoto.aws.s3.thumbnails-bucket}")
    private String thumbnailsBucket;

    @Value("${blitzphoto.image.thumbnail.width:300}")
    private int thumbnailWidth;

    @Value("${blitzphoto.image.thumbnail.height:300}")
    private int thumbnailHeight;

    @Value("${blitzphoto.image.thumbnail.quality:0.85}")
    private float thumbnailQuality;

    /**
     * Generate and upload thumbnail for a photo
     * 
     * @param s3Key Original photo S3 key
     * @param thumbnailS3Key Thumbnail S3 key
     * @return Thumbnail S3 key
     */
    public String generateAndUploadThumbnail(String s3Key, String thumbnailS3Key) {
        try {
            log.debug("Generating thumbnail for: {}", s3Key);

            // Download original image from S3
            BufferedImage originalImage = downloadImageFromS3(s3Key);
            if (originalImage == null) {
                throw new RuntimeException("Failed to download image from S3: " + s3Key);
            }

            // Generate thumbnail
            BufferedImage thumbnail = generateThumbnail(originalImage);

            // Upload thumbnail to S3
            uploadThumbnailToS3(thumbnail, thumbnailS3Key);

            log.info("Thumbnail generated and uploaded: {}", thumbnailS3Key);
            return thumbnailS3Key;

        } catch (Exception e) {
            log.error("Failed to generate thumbnail for: {}", s3Key, e);
            throw new RuntimeException("Failed to generate thumbnail", e);
        }
    }

    /**
     * Download image from S3
     */
    private BufferedImage downloadImageFromS3(String s3Key) throws IOException {
        try {
            // Download image from S3
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(uploadsBucket)
                    .key(s3Key)
                    .build();

            try (InputStream inputStream = s3Client.getObject(getRequest)) {
                return ImageIO.read(inputStream);
            }
        } catch (Exception e) {
            log.error("Failed to download image from S3: {}", s3Key, e);
            return null;
        }
    }

    /**
     * Generate thumbnail from original image
     */
    private BufferedImage generateThumbnail(BufferedImage originalImage) {
        // Calculate dimensions maintaining aspect ratio
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        double aspectRatio = (double) originalWidth / originalHeight;
        
        int thumbWidth = thumbnailWidth;
        int thumbHeight = thumbnailHeight;
        
        if (originalWidth > originalHeight) {
            thumbHeight = (int) (thumbWidth / aspectRatio);
        } else {
            thumbWidth = (int) (thumbHeight * aspectRatio);
        }

        // Create thumbnail
        BufferedImage thumbnail = new BufferedImage(thumbWidth, thumbHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = thumbnail.createGraphics();
        
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            
            g.drawImage(originalImage, 0, 0, thumbWidth, thumbHeight, null);
        } finally {
            g.dispose();
        }

        return thumbnail;
    }

    /**
     * Upload thumbnail to S3
     */
    private void uploadThumbnailToS3(BufferedImage thumbnail, String thumbnailS3Key) throws IOException {
        // Convert BufferedImage to byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(thumbnail, "jpg", baos);
        byte[] thumbnailBytes = baos.toByteArray();

        // Upload to S3
        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(thumbnailsBucket)
                .key(thumbnailS3Key)
                .contentType("image/jpeg")
                .serverSideEncryption(software.amazon.awssdk.services.s3.model.ServerSideEncryption.AES256)
                .build();

        s3Client.putObject(putRequest, RequestBody.fromBytes(thumbnailBytes));
    }

    /**
     * Extract image metadata (dimensions)
     * 
     * @param s3Key Photo S3 key
     * @return ImageMetadata with width and height
     */
    public ImageMetadata extractImageMetadata(String s3Key) {
        try {
            BufferedImage image = downloadImageFromS3(s3Key);
            if (image == null) {
                return null;
            }

            return new ImageMetadata(image.getWidth(), image.getHeight());
        } catch (Exception e) {
            log.error("Failed to extract image metadata for: {}", s3Key, e);
            return null;
        }
    }

    /**
     * Image Metadata Value Object
     */
    public record ImageMetadata(int width, int height) {}
}

