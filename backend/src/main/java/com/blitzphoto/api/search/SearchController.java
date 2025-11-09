package com.blitzphoto.api.search;

import com.blitzphoto.application.query.SearchPhotosQuery;
import com.blitzphoto.application.query.SearchPhotosQueryHandler;
import com.blitzphoto.domain.model.Photo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Search Controller
 * 
 * REST endpoints for advanced photo search.
 */
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Search", description = "Advanced photo search endpoints")
@SecurityRequirement(name = "bearer-jwt")
public class SearchController {

    private final SearchPhotosQueryHandler searchPhotosQueryHandler;

    /**
     * Search photos with advanced filters
     * 
     * @param userDetails Authenticated user details
     * @param fileName File name filter (partial match)
     * @param contentType Content type filter
     * @param minWidth Minimum width filter
     * @param maxWidth Maximum width filter
     * @param minHeight Minimum height filter
     * @param maxHeight Maximum height filter
     * @param minFileSize Minimum file size filter
     * @param maxFileSize Maximum file size filter
     * @param fromDate From date filter
     * @param toDate To date filter
     * @param page Page number (0-indexed)
     * @param size Number of items per page
     * @param sortBy Field to sort by
     * @param sortDirection Sort direction (asc or desc)
     * @return Paginated list of photos
     */
    @GetMapping("/photos")
    @Operation(summary = "Search photos", description = "Advanced photo search with filters")
    public ResponseEntity<Page<Photo>> searchPhotos(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "File name filter (partial match)")
            @RequestParam(required = false) String fileName,
            @Parameter(description = "Content type filter")
            @RequestParam(required = false) String contentType,
            @Parameter(description = "Minimum width filter")
            @RequestParam(required = false) Integer minWidth,
            @Parameter(description = "Maximum width filter")
            @RequestParam(required = false) Integer maxWidth,
            @Parameter(description = "Minimum height filter")
            @RequestParam(required = false) Integer minHeight,
            @Parameter(description = "Maximum height filter")
            @RequestParam(required = false) Integer maxHeight,
            @Parameter(description = "Minimum file size filter (bytes)")
            @RequestParam(required = false) Long minFileSize,
            @Parameter(description = "Maximum file size filter (bytes)")
            @RequestParam(required = false) Long maxFileSize,
            @Parameter(description = "From date filter (ISO 8601)")
            @RequestParam(required = false) Instant fromDate,
            @Parameter(description = "To date filter (ISO 8601)")
            @RequestParam(required = false) Instant toDate,
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") Integer page,
            @Parameter(description = "Number of items per page", example = "20")
            @RequestParam(defaultValue = "20") Integer size,
            @Parameter(description = "Field to sort by", example = "createdAt")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc or desc)", example = "desc")
            @RequestParam(defaultValue = "desc") String sortDirection) {

        UUID userId = UUID.fromString(userDetails.getUsername());

        SearchPhotosQuery query = SearchPhotosQuery.builder()
                .userId(userId)
                .fileName(fileName)
                .contentType(contentType)
                .minWidth(minWidth)
                .maxWidth(maxWidth)
                .minHeight(minHeight)
                .maxHeight(maxHeight)
                .minFileSize(minFileSize)
                .maxFileSize(maxFileSize)
                .fromDate(fromDate)
                .toDate(toDate)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        Page<Photo> photos = searchPhotosQueryHandler.handle(query);
        return ResponseEntity.ok(photos);
    }
}

