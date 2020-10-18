import React from "react";

interface ImgWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc: string;
}

/**
 * Everything an <img> is, except it additionally accepts a `fallbackSrc` property for when the loading the image at
 * `src` fails.
 * @param props 
 */
export function ImgWithFallback(props: ImgWithFallbackProps): JSX.Element {
    const {src, fallbackSrc, ...otherProps} = props;
    const [hasError, setHasError] = React.useState(false);
    const handleError = React.useCallback(() => {
        if (!hasError) {
            setHasError(true);
        }
    }, [hasError]);

    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...otherProps} src={hasError ? fallbackSrc : src} onError={handleError} />;
}
