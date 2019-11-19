const renderLinksWithPrefix = (prefix: string = '') => (links: string[]) => {
  if (links != null && links.length > 0) {
    if (links.length > 1) {
      return (
        <ul>
          {links.map(link => (
            <li key={link}>
              <a href={`${prefix}${link}`}>{link}</a>
            </li>
          ))}
        </ul>
      );
    } else {
      return <a href={`${prefix}${links[0]}`}>{links[0]}</a>;
    }
  } else {
    return 'Non communiqué';
  }
};

export const renderEmail = renderLinksWithPrefix('mailto:');

export const renderPhone = renderLinksWithPrefix('tel:');