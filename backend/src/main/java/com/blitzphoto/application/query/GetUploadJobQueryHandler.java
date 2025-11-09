package com.blitzphoto.application.query;

import com.blitzphoto.domain.model.UploadJob;
import com.blitzphoto.domain.repository.UploadJobRepository;
import com.blitzphoto.shared.exception.ForbiddenException;
import com.blitzphoto.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * GetUploadJobQueryHandler
 * 
 * CQRS Query Handler for retrieving upload jobs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GetUploadJobQueryHandler {

    private final UploadJobRepository uploadJobRepository;

    /**
     * Handle GetUploadJobQuery
     * 
     * @param query The query to handle
     * @return Upload job
     */
    public UploadJob handle(GetUploadJobQuery query) {
        log.debug("Handling GetUploadJobQuery: jobId={}, userId={}", 
                query.getUploadJobId(), query.getUserId());
        
        UploadJob uploadJob = uploadJobRepository.findById(query.getUploadJobId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Upload job not found: " + query.getUploadJobId()));
        
        // Authorization check: user can only access their own upload jobs
        if (!uploadJob.getUserId().equals(query.getUserId())) {
            throw new ForbiddenException(
                    "User does not have access to upload job: " + query.getUploadJobId());
        }
        
        log.debug("Found upload job: jobId={}, status={}", 
                uploadJob.getId(), uploadJob.getStatus());
        
        return uploadJob;
    }
}

