package com.blitzphoto.application.query;

import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * GetPhotosQueryHandler
 * 
 * CQRS Query Handler for retrieving photos.
 * Handles read operations (queries).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GetPhotosQueryHandler {

    private final PhotoRepository photoRepository;

    /**
     * Handle GetPhotosQuery
     * 
     * @param query The query to handle
     * @return Page of photos
     */
    public Page<Photo> handle(GetPhotosQuery query) {
        log.debug("Handling GetPhotosQuery for user {} with page {} and size {}", 
                query.getUserId(), query.getPage(), query.getSize());
        
        // Create pageable with sorting
        Sort sort = Sort.by(
                "DESC".equalsIgnoreCase(query.getSortDirection()) 
                        ? Sort.Direction.DESC 
                        : Sort.Direction.ASC,
                query.getSortBy()
        );
        
        Pageable pageable = PageRequest.of(query.getPage(), query.getSize(), sort);
        
        // Query photos by user ID
        Page<Photo> photos = photoRepository.findByUserId(query.getUserId(), pageable);
        
        log.debug("Found {} photos for user {}", photos.getTotalElements(), query.getUserId());
        
        return photos;
    }
}

