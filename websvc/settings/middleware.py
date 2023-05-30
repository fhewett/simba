import logging
import time

logger = logging.getLogger(__name__)

class TimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        # Code to be executed for each request before
        # the view (and later middleware) are called.
        logger.info(f'Start processing request {request.path} at {start_time}')

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.
        end_time = time.time()
        logger.info(f'Finished processing request {request.path} at {end_time}, took {end_time - start_time} seconds')

        return response
