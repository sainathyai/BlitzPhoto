package com.blitzphoto.application.query;

import com.blitzphoto.domain.model.Photo;
import com.blitzphoto.domain.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

/**
 * SearchPhotosQueryHandler
 * 
 * CQRS Query Handler for advanced photo search.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SearchPhotosQueryHandler {

    private final PhotoRepository photoRepository;

    /**
     * Handle SearchPhotosQuery
     */
    public Page<Photo> handle(SearchPhotosQuery query) {
        log.debug("Handling SearchPhotosQuery for user {} with filters", query.getUserId());

        // Create specification for filtering
        Specification<Photo> spec = (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // User filter (join with UploadJob)
            predicates.add(criteriaBuilder.equal(
                    root.join("uploadJob").get("userId"), query.getUserId()));

            // File name filter (partial match, case-insensitive)
            if (query.getFileName() != null && !query.getFileName().isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("fileName")),
                        "%" + query.getFileName().toLowerCase() + "%"));
            }

            // Content type filter
            if (query.getContentType() != null && !query.getContentType().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("contentType"), query.getContentType()));
            }

            // Width filters
            if (query.getMinWidth() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("width"), query.getMinWidth()));
            }
            if (query.getMaxWidth() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("width"), query.getMaxWidth()));
            }

            // Height filters
            if (query.getMinHeight() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("height"), query.getMinHeight()));
            }
            if (query.getMaxHeight() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("height"), query.getMaxHeight()));
            }

            // File size filters
            if (query.getMinFileSize() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("fileSize"), query.getMinFileSize()));
            }
            if (query.getMaxFileSize() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("fileSize"), query.getMaxFileSize()));
            }

            // Date filters
            if (query.getFromDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), query.getFromDate()));
            }
            if (query.getToDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), query.getToDate()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        // Create pageable with sorting
        Sort sort = Sort.by(
                "DESC".equalsIgnoreCase(query.getSortDirection())
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                query.getSortBy() != null ? query.getSortBy() : "createdAt"
        );

        Pageable pageable = PageRequest.of(
                query.getPage() != null ? query.getPage() : 0,
                query.getSize() != null ? query.getSize() : 20,
                sort
        );

        // Execute query
        Page<Photo> photos = photoRepository.findAll(spec, pageable);

        log.debug("Found {} photos for user {} with filters", photos.getTotalElements(), query.getUserId());

        return photos;
    }
}

